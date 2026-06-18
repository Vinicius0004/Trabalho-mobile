*** Settings ***
Documentation     Palavras-chave dos testes de produtos para a API DummyJSON.
Resource          ../base.robot
Resource          rotas.robot

*** Keywords ***
Listar Produtos
    [Documentation]    Recupera a lista de produtos.
    ${response}=    GET On Session    dummyjson    ${ROTA_PRODUTOS}    expected_status=200
    RETURN    ${response}

Buscar Produto Pelo ID
    [Documentation]    Recupera um produto pelo seu ID.
    [Arguments]    ${produto_id}
    ${response}=    GET On Session    dummyjson    ${ROTA_PRODUTOS}/${produto_id}    expected_status=any
    RETURN    ${response}

Listar Produtos Com Paginacao
    [Documentation]    Recupera produtos usando parâmetros limit e skip.
    [Arguments]    ${limit}=5    ${skip}=0
    ${params}=    Create Dictionary    limit=${limit}    skip=${skip}
    ${response}=    GET On Session    dummyjson    ${ROTA_PRODUTOS}    params=${params}    expected_status=200
    RETURN    ${response}

Buscar Produtos Por Termo
    [Documentation]    Busca produtos por um termo de pesquisa.
    [Arguments]    ${termo}
    ${params}=    Create Dictionary    q=${termo}
    ${response}=    GET On Session    dummyjson    ${ROTA_BUSCAR_PRODUTO}    params=${params}    expected_status=200
    RETURN    ${response}

Criar Produto
    [Documentation]    Envia um POST para criar um produto com massa dinâmica.
    ${payload}=    Gerar Dados De Produto
    ${response}=    POST On Session    dummyjson    ${ROTA_CRIAR_PRODUTO}    json=${payload}    expected_status=any
    RETURN    ${response}    ${payload}

Atualizar Titulo Do Produto
    [Documentation]    Atualiza o título de um produto existente.
    [Arguments]    ${produto_id}
    ${titulo}=    Gerar Nome De Produto
    ${payload}=    Create Dictionary    title=${titulo}
    ${response}=    PUT On Session    dummyjson    ${ROTA_PRODUTOS}/${produto_id}    json=${payload}    expected_status=any
    RETURN    ${response}    ${payload}

Excluir Produto
    [Documentation]    Remove um produto pelo ID.
    [Arguments]    ${produto_id}
    ${response}=    DELETE On Session    dummyjson    ${ROTA_PRODUTOS}/${produto_id}    expected_status=any
    RETURN    ${response}

Verificar Lista De Produtos
    [Documentation]    Verifica a estrutura da lista de produtos.
    [Arguments]    ${response}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    products    total    skip    limit
    ${produtos}=    Get From Dictionary    ${json}    products
    Should Not Be Empty    ${produtos}
    ${primeiro_produto}=    Get From List    ${produtos}    0
    Verificar Campos No JSON    ${primeiro_produto}    id    title    price    category

Verificar Produto Encontrado
    [Documentation]    Verifica os dados de um produto encontrado pelo ID.
    [Arguments]    ${response}    ${produto_id}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    id    title    price    category
    Should Be Equal As Integers    ${json}[id]    ${produto_id}
    Verificar Campo Preenchido    ${json}    title

Verificar Produto Criado
    [Documentation]    Verifica o retorno do POST de produto.
    [Arguments]    ${response}    ${payload}
    ${status}=    Convert To Integer    ${response.status_code}
    Should Be True    ${status} == 200 or ${status} == 201
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    id    title    price
    Should Be Equal    ${json}[title]    ${payload}[title]
    Should Be Equal As Integers    ${json}[price]    ${payload}[price]

Verificar Produto Atualizado
    [Documentation]    Verifica o retorno do PUT de produto.
    [Arguments]    ${response}    ${payload}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    id    title
    Should Be Equal    ${json}[title]    ${payload}[title]

Verificar Produto Excluido
    [Documentation]    Verifica o retorno do DELETE de produto.
    [Arguments]    ${response}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    id    title    isDeleted    deletedOn
    Should Be True    ${json}[isDeleted]

Verificar Produto Nao Encontrado
    [Documentation]    Verifica que a API retorna 404 para produto inexistente.
    [Arguments]    ${response}
    Verificar Status Code    ${response}    404
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campo Preenchido    ${json}    message

Verificar Busca De Produtos
    [Documentation]    Verifica o retorno de uma busca de produtos.
    [Arguments]    ${response}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    products    total    skip    limit
