*** Settings ***
Documentation     Testes de criação, atualização e exclusão de produtos.
Resource          ../resources/base.robot
Resource          ../resources/requests/produtos_keywords.robot
Suite Setup       Abrir Sessao Da API
Test Tags         produtos    crud

*** Test Cases ***
Criar produto com massa dinâmica
    [Tags]    positivo    post    massa_dinamica
    ${response}    ${payload}=    Criar Produto
    Verificar Produto Criado    ${response}    ${payload}

Atualizar produto existente
    [Tags]    positivo    put
    ${response}    ${payload}=    Atualizar Titulo Do Produto    ${PRODUTO_ID_VALIDO}
    Verificar Produto Atualizado    ${response}    ${payload}

Excluir produto existente
    [Tags]    positivo    delete
    ${response}=    Excluir Produto    ${PRODUTO_ID_VALIDO}
    Verificar Produto Excluido    ${response}
