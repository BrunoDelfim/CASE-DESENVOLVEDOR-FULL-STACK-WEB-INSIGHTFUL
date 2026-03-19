import { useEffect, useMemo, useState } from 'react'
import api from './api'

const initialForm = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  image_url: '',
}

const initialCategoryForm = {
  name: '',
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [authMode, setAuthMode] = useState('login')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterPasswordConfirmation, setShowRegisterPasswordConfirmation] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [productImageError, setProductImageError] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [productForm, setProductForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [productPagination, setProductPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  })
  const [categoryPagination, setCategoryPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const loginEmailValid = useMemo(() => {
    if (!loginForm.email) return true
    return emailRegex.test(loginForm.email)
  }, [loginForm.email])

  const registerEmailValid = useMemo(() => {
    if (!registerForm.email) return true
    return emailRegex.test(registerForm.email)
  }, [registerForm.email])

  const passwordChecks = useMemo(() => {
    const password = registerForm.password

    return {
      minLength: password.length >= 6,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
      matches:
          password.length > 0 &&
          registerForm.password_confirmation.length > 0 &&
          password === registerForm.password_confirmation,
    }
  }, [registerForm.password, registerForm.password_confirmation])

  const registerFormValid =
      registerForm.name.trim() &&
      registerEmailValid &&
      passwordChecks.minLength &&
      passwordChecks.hasLetter &&
      passwordChecks.hasNumber &&
      passwordChecks.matches

  const loginFormValid =
      loginForm.email.trim() &&
      loginEmailValid &&
      loginForm.password.trim()

  async function handleLogin(e) {
    e.preventDefault()
    setMessage('')

    if (!loginEmailValid) {
      showMessage('Informe um e-mail válido.', 'error', false)
      return
    }

    try {
      const response = await api.post('/login', loginForm)
      const newToken = response.data.token

      localStorage.setItem('token', newToken)
      setToken(newToken)
      showMessage('Login realizado com sucesso.', 'success')
    } catch (error) {
      showMessage('Erro ao fazer login. Verifique suas credenciais.', 'error')
      console.error(error)
    }
  }

  async function handleViewProduct(id) {
    try {
      const response = await api.get(`/products/${id}`)
      setSelectedProduct(response.data)
      setProductImageError(false)
      setIsProductModalOpen(true)
    } catch (error) {
      console.error(error)
      showMessage('Erro ao carregar detalhes do produto.', 'error')
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setMessage('')

    if (!registerEmailValid) {
      showMessage('Informe um e-mail válido.', 'error')
      return
    }

    if (!passwordChecks.minLength || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      showMessage('A senha precisa ter pelo menos 6 caracteres, letra e número.', 'error')
      return
    }

    if (!passwordChecks.matches) {
      showMessage('As senhas não coincidem.', 'error')
      return
    }

    try {
      await api.post('/register', {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      })

      setRegisterForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      })

      setAuthMode('login')
      showMessage('Cadastro realizado com sucesso. Faça login para continuar.', 'success')
    } catch (error) {
      showMessage('Erro ao realizar cadastro.', 'error')
      console.error(error)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken('')
    setCategories([])
    setProducts([])
    setEditingId(null)
    setEditingCategoryId(null)
    setProductForm(initialForm)
    setCategoryForm(initialCategoryForm)
    setIsCategoryModalOpen(false)
    showMessage('Logout realizado.', 'success')
  }

  async function loadCategories(page = 1) {
    try {
      const response = await api.get(`/categories?page=${page}&per_page=5`)

      setCategories(response.data.data)
      setCategoryPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      })
    } catch (error) {
      console.error(error)
      showMessage('Erro ao carregar categorias.', 'error')
    }
  }

  async function loadProducts(categoryId = filterCategoryId, page = 1, search = searchTerm) {
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '5',
      })

      if (categoryId) {
        params.append('category_id', categoryId)
      }

      if (search) {
        params.append('search', search)
      }

      const response = await api.get(`/products?${params.toString()}`)

      setProducts(response.data.data)
      setProductPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      })
    } catch (error) {
      console.error(error)
      showMessage('Erro ao carregar produtos.', 'error')
    }
  }

  useEffect(() => {
    if (token) {
      loadCategories(1)
      loadProducts('', 1)
    }
  }, [token])

  async function handleSubmitCategory(e) {
    e.preventDefault()
    setMessage('')

    try {
      if (editingCategoryId) {
        await api.put(`/categories/${editingCategoryId}`, categoryForm)
        showMessage('Categoria atualizada com sucesso.', 'success')
      } else {
        await api.post('/categories', categoryForm)
        showMessage('Categoria criada com sucesso.', 'success')
      }

      setCategoryForm(initialCategoryForm)
      setEditingCategoryId(null)
      await loadCategories()
    } catch (error) {
      console.error(error)
      showMessage('Erro ao salvar categoria.', 'error')
    }
  }

  function handleEditCategory(category) {
    setIsCategoryModalOpen(true)
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name || '',
    })
    showMessage(`Editando categoria ${category.name}`, 'info')
  }

  async function handleDeleteCategory(id) {
    const confirmed = window.confirm('Deseja excluir esta categoria?')

    if (!confirmed) return

    try {
      await api.delete(`/categories/${id}`)
      await loadCategories()

      if (Number(productForm.category_id) === id) {
        setProductForm({ ...productForm, category_id: '' })
      }

      if (Number(filterCategoryId) === id) {
        setFilterCategoryId('')
        await loadProducts()
      } else {
        await loadProducts(filterCategoryId)
      }

      showMessage('Categoria removida com sucesso.', 'success')
    } catch (error) {
      console.error(error)
      showMessage('Erro ao remover categoria. Verifique se ela está vinculada a produtos.', 'error')
    }
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null)
    setCategoryForm(initialCategoryForm)
    setMessage('')
  }

  async function handleSubmitProduct(e) {
    e.preventDefault()
    setMessage('')

    try {
      const payload = {
        ...productForm,
        price: parseCurrency(productForm.price),
        category_id: Number(productForm.category_id),
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, payload)
        showMessage('Produto atualizado com sucesso.', 'success')
      } else {
        await api.post('/products', payload)
        showMessage('Produto criado com sucesso.', 'success')
      }

      setProductForm(initialForm)
      setEditingId(null)
      await loadProducts(filterCategoryId)
    } catch (error) {
        console.error(error)

        if (error.response?.status === 422 && error.response?.data?.errors) {
          const errors = error.response.data.errors

          // se erro de image_url
          if (errors.image_url) {
            showMessage(errors.image_url[0], 'error')
            return
          }

          // pega o primeiro erro geral
          const firstError = Object.values(errors)[0][0]
          showMessage(firstError)
          return
        }

        showMessage('Erro ao salvar produto.', 'error')
      }
  }

  function handleEdit(product) {
    setEditingId(product.id)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? formatCurrency(product.price) : '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
    })
    showMessage(`Editando o produto ${product.name}`, 'info')
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Deseja excluir este produto?')

    if (!confirmed) return

    try {
      await api.delete(`/products/${id}`)
      await loadProducts(filterCategoryId)
      showMessage('Produto removido com sucesso.', 'success')
    } catch (error) {
      console.error(error)
      showMessage('Erro ao remover produto.', 'error')
    }
  }

  async function handleFilterChange(e) {
    const value = e.target.value
    setFilterCategoryId(value)
  }

  function cancelEdit() {
    setEditingId(null)
    setProductForm(initialForm)
    setMessage('')
  }

  function formatCurrency(value) {
    const number = Number(value)

    if (isNaN(number)) return ''

    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function handlePriceChange(value) {

    const numeric = value.replace(/\D/g, '')
    const number = Number(numeric) / 100

    if (!numeric) {
      setProductForm({ ...productForm, price: '', image_url: productForm.image_url || '' })
      return
    }

    const formatted = number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    setProductForm({
      ...productForm,
      price: formatted,
      image_url: productForm.image_url || ''
    })
  }

  function parseCurrency(value) {
    if (!value) return 0

    return Number(
        value
            .replace(/\s/g, '')
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
    )
  }

  function showMessage(text, type = 'info', fade=true) {
    setMessage(text)
    setMessageType(type)

    if (fade === true) {
      setTimeout(() => {
        setMessage('')
      }, 6000)
    }
  }

  if (!token) {
    return (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Catálogo de E-commerce</h1>
              <p>
                {authMode === 'login'
                    ? 'Entre para gerenciar produtos e categorias.'
                    : 'Crie sua conta para acessar o catálogo.'}
              </p>
            </div>

            {message && (
                <p className={`message ${messageType}`}>
                  {message}
                </p>
            )}

            {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="form auth-form">
                  <div className="field-group">
                    <label htmlFor="login-email">E-mail</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={loginForm.email}
                        onChange={(e) =>
                            setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        className={!loginEmailValid ? 'input-error' : ''}
                        required
                    />
                    {!loginEmailValid && (
                        <span className="field-error">Digite um e-mail válido.</span>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor="login-password">Senha</label>
                    <div className="password-field">
                      <input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={loginForm.password}
                          onChange={(e) =>
                              setLoginForm({ ...loginForm, password: e.target.value })
                          }
                          required
                      />
                      <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                      >
                        {showLoginPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={!loginFormValid}>
                    Entrar
                  </button>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="form auth-form">
                  <div className="field-group">
                    <label htmlFor="register-name">Nome</label>
                    <input
                        id="register-name"
                        type="text"
                        placeholder="Seu nome"
                        value={registerForm.name}
                        onChange={(e) =>
                            setRegisterForm({ ...registerForm, name: e.target.value })
                        }
                        required
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="register-email">E-mail</label>
                    <input
                        id="register-email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={registerForm.email}
                        onChange={(e) =>
                            setRegisterForm({ ...registerForm, email: e.target.value })
                        }
                        className={!registerEmailValid ? 'input-error' : ''}
                        required
                    />
                    {!registerEmailValid && (
                        <span className="field-error">Digite um e-mail válido.</span>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor="register-password">Senha</label>
                    <div className="password-field">
                      <input
                          id="register-password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Crie uma senha"
                          value={registerForm.password}
                          onChange={(e) =>
                              setRegisterForm({ ...registerForm, password: e.target.value })
                          }
                          required
                      />
                      <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                      >
                        {showRegisterPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>

                    <div className="password-rules">
                  <span className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                    • mínimo de 6 caracteres
                  </span>
                      <span className={passwordChecks.hasLetter ? 'valid' : 'invalid'}>
                    • pelo menos uma letra
                  </span>
                      <span className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                    • pelo menos um número
                  </span>
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="register-password-confirmation">Confirmar senha</label>
                    <div className="password-field">
                      <input
                          id="register-password-confirmation"
                          type={showRegisterPasswordConfirmation ? 'text' : 'password'}
                          placeholder="Repita a senha"
                          value={registerForm.password_confirmation}
                          onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                password_confirmation: e.target.value,
                              })
                          }
                          required
                      />
                      <button
                          type="button"
                          className="toggle-password"
                          onClick={() =>
                              setShowRegisterPasswordConfirmation((prev) => !prev)
                          }
                      >
                        {showRegisterPasswordConfirmation ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>

                    {registerForm.password_confirmation && (
                        <span
                            className={`field-helper ${
                                passwordChecks.matches ? 'valid' : 'invalid'
                            }`}
                        >
                    {passwordChecks.matches
                        ? 'As senhas coincidem.'
                        : 'As senhas não coincidem.'}
                  </span>
                    )}
                  </div>

                  <button type="submit" disabled={!registerFormValid}>
                    Cadastrar
                  </button>
                </form>
            )}

            <div className="auth-switch">
              {authMode === 'login' ? (
                  <p>
                    Não tem conta?{' '}
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                          setAuthMode('register')
                          setMessage('')
                        }}
                    >
                      Cadastre-se
                    </button>
                  </p>
              ) : (
                  <p>
                    Já tem conta?{' '}
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                          setAuthMode('login')
                          setMessage('')
                        }}
                    >
                      Voltar para login
                    </button>
                  </p>
              )}
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="container">
        <div className="header">
          <h1>Catálogo de Produtos</h1>
          <div className="header-buttons">
            <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(true)
                  setEditingCategoryId(null)
                  setCategoryForm(initialCategoryForm)
                  setMessage('')
                }}
            >
              Gerenciar categorias
            </button>
            <button onClick={handleLogout}>Sair</button>
          </div>
        </div>

        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}

        <div className="card">
          <h2>{editingId ? 'Editar produto' : 'Gerenciar produtos'}</h2>

          <form onSubmit={handleSubmitProduct} className="form">
            <input
                type="text"
                placeholder="Nome"
                value={productForm.name}
                onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value, image_url: productForm.image_url || '' })
                }
                required
            />

            <textarea
                placeholder="Descrição"
                value={productForm.description}
                onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value, image_url: productForm.image_url || '' })
                }
            />

            <input
                type="text"
                placeholder="R$ 0,00"
                value={productForm.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
            />

            <select
                value={productForm.category_id}
                onChange={(e) =>
                    setProductForm({ ...productForm, category_id: e.target.value, image_url: productForm.image_url || '' })
                }
                required
            >
              <option value="">Selecione a categoria</option>
              {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
              ))}
            </select>

            <input
                type="text"
                placeholder="URL da imagem"
                value={productForm.image_url}
                onChange={(e) =>
                    setProductForm({ ...productForm, image_url: e.target.value })
                }
            />

            <div className="actions">
              <button type="submit">
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>

              {editingId && (
                  <button type="button" onClick={cancelEdit}>
                    Cancelar
                  </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Filtrar produtos</h2>

          <div className="inline">
            <div className="filters-inline">
              <div className="field-inline">
                <label htmlFor="filter-category">Categoria</label>
                <select
                    id="filter-category"
                    className="space-right"
                    value={filterCategoryId}
                    onChange={handleFilterChange}
                >
                  <option value="">Todas</option>
                  {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                  ))}
                </select>
              </div>

              <div className="field-inline">
                <label htmlFor="filter-search">Buscar produto</label>
                <input
                    id="filter-search"
                    type="text"
                    placeholder="Nome ou descrição"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="actions">
              <button
                  type="button"
                  onClick={() => loadProducts(filterCategoryId, 1, searchTerm)}
              >
                Buscar
              </button>

              <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterCategoryId('')
                    loadProducts('', 1, '')
                  }}
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Produtos</h2>

          <div className="product-list">
            {products.length === 0 && <p>Nenhum produto encontrado.</p>}

            {products.map((product) => (
                <div key={product.id} className="product-item">
                  <div>
                    <strong>{product.name}</strong>

                    <p>Preço: R$ {Number(product.price).toFixed(2)}</p>
                    <p>Categoria: {product.category?.name || 'Sem categoria'}</p>
                  </div>

                  <div className="actions">
                    <button onClick={() => handleEdit(product)}>Editar</button>
                    <button onClick={() => handleDelete(product.id)}>Excluir</button>
                    <button type="button" onClick={() => handleViewProduct(product.id)}>
                      Detalhes
                    </button>
                  </div>
                </div>
            ))}
          </div>
          <div className="pagination">
            <button
                type="button"
                onClick={() => loadProducts(filterCategoryId, productPagination.current_page - 1)}
                disabled={productPagination.current_page === 1}
            >
              Anterior
            </button>

            <span>
              Página {productPagination.current_page} de {productPagination.last_page}
            </span>

            <button
                type="button"
                onClick={() => loadProducts(filterCategoryId, productPagination.current_page + 1)}
                disabled={productPagination.current_page === productPagination.last_page}
            >
              Próxima
            </button>
          </div>
        </div>
        {isCategoryModalOpen && (
            <div
                className="modal-overlay"
                onClick={() => {
                  setIsCategoryModalOpen(false)
                  setEditingCategoryId(null)
                  setCategoryForm(initialCategoryForm)
                }}
            >
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingCategoryId ? 'Editar categoria' : 'Gerenciar categorias'}</h2>
                  <button
                      type="button"
                      className="modal-close"
                      onClick={() => {
                        setIsCategoryModalOpen(false)
                        setEditingCategoryId(null)
                        setCategoryForm(initialCategoryForm)
                      }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmitCategory} className="form">
                  <input
                      type="text"
                      placeholder="Nome da categoria"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ name: e.target.value })}
                      required
                  />

                  <div className="actions">
                    <button type="submit">
                      {editingCategoryId ? 'Atualizar' : 'Salvar'}
                    </button>

                    {editingCategoryId && (
                        <button
                            type="button"
                            onClick={cancelCategoryEdit}
                        >
                          Cancelar
                        </button>
                    )}
                  </div>
                </form>

                <div className="category-list">
                  {categories.length === 0 && <p>Nenhuma categoria cadastrada.</p>}

                  {categories.map((category) => (
                      <div key={category.id} className="category-item">
                        <span>{category.name}</span>

                        <div className="actions">
                          <button type="button" onClick={() => handleEditCategory(category)}>
                            Editar
                          </button>
                          <button type="button" onClick={() => handleDeleteCategory(category.id)}>
                            Excluir
                          </button>
                        </div>
                      </div>
                  ))}
                </div>

                <div className="pagination">
                  <button
                      type="button"
                      onClick={() => loadCategories(categoryPagination.current_page - 1)}
                      disabled={categoryPagination.current_page === 1}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {categoryPagination.current_page} de {categoryPagination.last_page}
                  </span>

                  <button
                      type="button"
                      onClick={() => loadCategories(categoryPagination.current_page + 1)}
                      disabled={categoryPagination.current_page === categoryPagination.last_page}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
        )}

        {isProductModalOpen && selectedProduct && (
            <div
                className="modal-overlay"
                onClick={() => {
                  setIsProductModalOpen(false)
                  setSelectedProduct(null)
                }}
            >
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Detalhes do produto</h2>
                  <button
                      type="button"
                      className="modal-close"
                      onClick={() => {
                        setIsProductModalOpen(false)
                        setSelectedProduct(null)
                      }}
                  >
                    ×
                  </button>
                </div>

                <div className="product-details">
                  <p><strong>Nome:</strong> {selectedProduct.name}</p>
                  <p><strong>Descrição:</strong> {selectedProduct.description || 'Sem descrição'}</p>
                  <p><strong>Preço:</strong> R$ {Number(selectedProduct.price).toFixed(2)}</p>
                  <p><strong>Categoria:</strong> {selectedProduct.category?.name || 'Sem categoria'}</p>
                  <p><strong>Imagem/URL:</strong></p>
                    <div className="product-image-wrapper">
                      {selectedProduct.image_url ? (
                          !productImageError ? (
                              <img
                                  src={selectedProduct.image_url}
                                  alt={selectedProduct.name}
                                  className="product-details-image"
                                  onError={() => setProductImageError(true)}
                              />
                          ) : (
                              <div className="image-fallback">
                                <p>Não foi possível carregar a imagem.</p>
                                <a
                                    href={selectedProduct.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                  Abrir link da imagem
                                </a>
                              </div>
                          )
                      ) : (
                        <p>Sem imagem cadastrada.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default App