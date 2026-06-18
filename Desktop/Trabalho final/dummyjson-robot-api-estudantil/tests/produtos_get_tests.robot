*** Settings ***
Documentation     Testes GET de produtos.
Resource          ../resources/base.robot
Resource          ../resources/requests/produtos_keywords.robot
Suite Setup       Criar Sessao Da API
Test Tags         produtos    get

*** Test Cases ***
Listar Produtos Deve Retornar Lista
    [Tags]    positivo
    ${response}=    Listar Produtos
    Validar Lista De Produtos    ${response}

Buscar Produto Por Id Deve Retornar Produto
    [Tags]    positivo
    ${response}=    Buscar Produto Por Id    ${PRODUTO_ID_VALIDO}
    Validar Produto Encontrado    ${response}    ${PRODUTO_ID_VALIDO}

Listar Produtos Com Limite Deve Retornar Lista
    [Tags]    positivo    query_params
    ${response}=    Listar Produtos Com Limite    5    0
    Validar Lista De Produtos    ${response}

Pesquisar Produto Deve Retornar Resultado
    [Tags]    positivo    search
    ${response}=    Pesquisar Produto    phone
    Validar Busca De Produtos    ${response}
