*** Settings ***
Documentation     Keywords dos testes de produtos
Resource          ../base.robot
Resource          rotas.robot

*** Keywords ***
Listar Produtos
    [Documentation]    Faz GET na lista de produtos
    ${response}=    GET On Session    dummyjson    ${ROTA_PRODUTOS}    expected_status=200
    RETURN    ${response}

Buscar Produto Por Id
    [Documentation]    Faz GET em um produto específico
    [Arguments]    ${produto_id}
    ${response}=    GET On Session    dummyjson    ${ROTA_PRODUTOS}/${produto_id}    expected_status=any
    RETURN    ${response}

Listar Produtos Com Limite
    [Documentation]    Faz GET usando query params limit e skip
    [Arguments]    ${limit}=5    ${skip}=0
    ${params}=    Create Dictionary    limit=${limit}    skip=${skip}
    ${response}=    GET On Session    dummyjson    ${ROTA_PRODUTOS}    params=${params}    expected_status=200
    RETURN    ${response}

Pesquisar Produto
    [Documentation]    Faz busca de produto por termo
    [Arguments]    ${termo}
    ${params}=    Create Dictionary    q=${termo}
    ${response}=    GET On Session    dummyjson    ${ROTA_BUSCAR_PRODUTO}    params=${params}    expected_status=200
    RETURN    ${response}

Criar Produto
    [Documentation]    Faz POST de produto com massa dinâmica
    ${payload}=    Montar Produto Para Cadastro
    ${response}=    POST On Session    dummyjson    ${ROTA_CRIAR_PRODUTO}    json=${payload}    expected_status=any
    RETURN    ${response}    ${payload}

Atualizar Produto
    [Documentation]    Faz PUT alterando o título de um produto
    [Arguments]    ${produto_id}
    ${titulo}=    Gerar Nome De Produto
    ${payload}=    Create Dictionary    title=${titulo}
    ${response}=    PUT On Session    dummyjson    ${ROTA_PRODUTOS}/${produto_id}    json=${payload}    expected_status=any
    RETURN    ${response}    ${payload}

Deletar Produto
    [Documentation]    Faz DELETE de um produto
    [Arguments]    ${produto_id}
    ${response}=    DELETE On Session    dummyjson    ${ROTA_PRODUTOS}/${produto_id}    expected_status=any
    RETURN    ${response}

Validar Lista De Produtos
    [Documentation]    Valida estrutura básica da listagem de produtos
    [Arguments]    ${response}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    products    total    skip    limit
    ${produtos}=    Get From Dictionary    ${json}    products
    Should Not Be Empty    ${produtos}
    ${primeiro_produto}=    Get From List    ${produtos}    0
    Conferir Campos No Json    ${primeiro_produto}    id    title    price    category

Validar Produto Encontrado
    [Documentation]    Valida um produto retornado pelo ID
    [Arguments]    ${response}    ${produto_id}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    id    title    price    category
    Should Be Equal As Integers    ${json}[id]    ${produto_id}
    Conferir Campo Preenchido    ${json}    title

Validar Produto Criado
    [Documentation]    Valida retorno do POST de produto
    [Arguments]    ${response}    ${payload}
    ${status}=    Convert To Integer    ${response.status_code}
    Should Be True    ${status} == 200 or ${status} == 201
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    id    title    price
    Should Be Equal    ${json}[title]    ${payload}[title]
    Should Be Equal As Integers    ${json}[price]    ${payload}[price]

Validar Produto Atualizado
    [Documentation]    Valida retorno do PUT de produto
    [Arguments]    ${response}    ${payload}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    id    title
    Should Be Equal    ${json}[title]    ${payload}[title]

Validar Produto Deletado
    [Documentation]    Valida retorno do DELETE de produto.
    [Arguments]    ${response}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    id    title    isDeleted    deletedOn
    Should Be True    ${json}[isDeleted]

Validar Produto Nao Encontrado
    [Documentation]    Valida retorno 404 para produto inexistente.
    [Arguments]    ${response}
    Conferir Status Code    ${response}    404
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campo Preenchido    ${json}    message

Validar Busca De Produtos
    [Documentation]    Valida retorno da busca de produtos
    [Arguments]    ${response}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    products    total    skip    limit
