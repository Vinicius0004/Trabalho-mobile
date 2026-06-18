*** Settings ***
Documentation     Testes GET de produtos.
Resource          ../resources/base.robot
Resource          ../resources/requests/produtos_keywords.robot
Suite Setup       Abrir Sessao Da API
Test Tags         produtos    get

*** Test Cases ***
Listar produtos deve retornar lista
    [Tags]    positivo
    ${response}=    Listar Produtos
    Verificar Lista De Produtos    ${response}

Buscar produto por ID deve retornar produto
    [Tags]    positivo
    ${response}=    Buscar Produto Pelo ID    ${PRODUTO_ID_VALIDO}
    Verificar Produto Encontrado    ${response}    ${PRODUTO_ID_VALIDO}

Listar produtos com limite deve retornar lista
    [Tags]    positivo    query_params
    ${response}=    Listar Produtos Com Paginacao    5    0
    Verificar Lista De Produtos    ${response}

Pesquisar produto deve retornar resultado
    [Tags]    positivo    search
    ${response}=    Buscar Produtos Por Termo    phone
    Verificar Busca De Produtos    ${response}
