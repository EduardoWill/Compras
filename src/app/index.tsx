import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc // Melhor prática para datas no Firebase
} from 'firebase/firestore';

import { db } from '@/services/firebaseConfig';

// Interface para garantir a tipagem correta dos dados
interface ItemCompra {
  id: string;
  produto: string;
  quantidade: string;
}

export default function HomeScreen() {
  const [produto, setProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [lista, setLista] = useState<ItemCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Função para salvar ou atualizar no Firestore
  async function adicionarProduto() {
    if (produto.trim() === '' || quantidade.trim() === '') {
      Alert.alert('Atenção', 'Preencha todos os campos!')
      return
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'compras', editingId), {
          produto: produto,
          quantidade: quantidade,
        })
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'compras'), {
          produto: produto,
          quantidade: quantidade,
          createdAt: serverTimestamp(),
        })
      }

      setProduto('')
      setQuantidade('')
      // Não precisa chamar carregarProdutos() aqui, o onSnapshot faz isso sozinho!
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Erro ao salvar no banco de dados.')
    }
  }

  function iniciarEdicao(item: ItemCompra) {
    setProduto(item.produto)
    setQuantidade(item.quantidade)
    setEditingId(item.id)
  }

  function cancelarEdicao() {
    setProduto('')
    setQuantidade('')
    setEditingId(null)
  }

  async function confirmarExcluirProduto(itemId: string) {
    try {
      await deleteDoc(doc(db, 'compras', itemId))
      if (editingId === itemId) {
        cancelarEdicao()
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Erro ao excluir o produto.')
    }
  }

  function excluirProduto(itemId: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Deseja remover este produto?')) {
        confirmarExcluirProduto(itemId)
      }
      return
    }

    Alert.alert('Excluir produto', 'Deseja remover este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => confirmarExcluirProduto(itemId),
      },
    ])
  }

  // Hook para buscar dados em tempo real
  useEffect(() => {
    const q = query(collection(db, 'compras'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itens: ItemCompra[] = []
      
      querySnapshot.forEach((snapshotDoc) => {
        itens.push({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        } as ItemCompra)
      })

      setLista(itens)
      setLoading(false)
    }, (error) => {
      console.error("Erro no Snapshot: ", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🛒 Lista de Compras</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o produto"
        placeholderTextColor="#888"
        value={produto}
        onChangeText={setProduto}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite a quantidade"
        placeholderTextColor="#888"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        maxLength={2}
      />

      <TouchableOpacity style={styles.button} onPress={adicionarProduto}>
        <Text style={styles.buttonText}>{editingId ? 'Atualizar' : '+ Adicionar'}</Text>
      </TouchableOpacity>

      {editingId ? (
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelarEdicao}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.productName}>🛍️ {item.produto}</Text>
              <Text style={styles.quantity}>Quantidade: {item.quantidade}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => iniciarEdicao(item)}>
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => excluirProduto(item.id)}>
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>
          )}
        />
      )}
    </SafeAreaView>
  )
}

// O objeto styles que estava faltando:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    color: '#BDBDBD',
    fontSize: 15,
    marginTop: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#2563EB',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
})