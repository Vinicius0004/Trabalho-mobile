*** Settings ***
Documentation     Testes de autenticação na API DummyJSON.
Resource          ../resources/base.robot
Resource          ../resources/requests/auth_keywords.robot
Suite Setup       Criar Sessao Da API
Test Tags         auth

*** Test Cases ***
Login Valido Deve Retornar Token
    [Tags]    positivo    login
    ${response}=    Fazer Login Valido
    Validar Login Com Sucesso    ${response}

Usuario Logado Deve Retornar Dados Do Usuario
    [Tags]    positivo    bearer_token
    ${login}=    Fazer Login Valido
    ${token}=    Pegar Access Token    ${login}
    ${response}=    Buscar Usuario Logado    ${token}
    Validar Usuario Logado    ${response}

Login Com Usuario Invalido Deve Retornar Erro
    [Tags]    negativo    login
    ${response}=    Fazer Login Invalido
    Validar Retorno De Erro    ${response}    400

Login Sem Username Deve Retornar Erro
    [Tags]    negativo    campo_obrigatorio
    ${response}=    Fazer Login Sem Username
    Validar Retorno De Erro    ${response}    400

Login Sem Password Deve Retornar Erro
    [Tags]    negativo    campo_obrigatorio
    ${response}=    Fazer Login Sem Password
    Validar Retorno De Erro    ${response}    400

Usuario Com Token Invalido Deve Retornar Erro
    [Tags]    negativo    bearer_token
    ${response}=    Buscar Usuario Com Token Invalido
    Validar Retorno De Erro    ${response}    401

Usuario Sem Token Deve Retornar Erro
    [Tags]    negativo    bearer_token
    ${response}=    Buscar Usuario Sem Enviar Token
    Validar Retorno De Erro    ${response}    401
