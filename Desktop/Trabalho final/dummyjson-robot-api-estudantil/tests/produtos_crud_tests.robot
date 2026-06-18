*** Settings ***
Documentation     Testes POST, PUT e DELETE de produtos.
Resource          ../resources/base.robot
Resource          ../resources/requests/produtos_keywords.robot
Suite Setup       Criar Sessao Da API
Test Tags         produtos    crud

*** Test Cases ***
Criar Produto Com Massa Dinamica
    [Tags]    positivo    post    massa_dinamica
    ${response}    ${payload}=    Criar Produto
    Validar Produto Criado    ${response}    ${payload}

Atualizar Produto Existente
    [Tags]    positivo    put
    ${response}    ${payload}=    Atualizar Produto    ${PRODUTO_ID_VALIDO}
    Validar Produto Atualizado    ${response}    ${payload}

Deletar Produto Existente
    [Tags]    positivo    delete
    ${response}=    Deletar Produto    ${PRODUTO_ID_VALIDO}
    Validar Produto Deletado    ${response}
