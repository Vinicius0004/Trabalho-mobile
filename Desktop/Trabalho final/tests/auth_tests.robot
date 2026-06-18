*** Settings ***
Documentation     Testes de autenticação na API DummyJSON.
Resource          ../resources/base.robot
Resource          ../resources/requests/auth_keywords.robot
Suite Setup       Abrir Sessao Da API
Test Tags         auth

*** Test Cases ***
Login válido deve retornar token
    [Tags]    positivo    login
    ${response}=    Login Valido
    Verificar Login Com Sucesso    ${response}

Usuário logado deve retornar dados do usuário
    [Tags]    positivo    bearer_token
    ${login}=    Login Valido
    ${token}=    Extrair Access Token    ${login}
    ${response}=    Consultar Usuario Logado    ${token}
    Verificar Usuario Logado    ${response}

Login com usuário inválido deve retornar erro
    [Tags]    negativo    login
    ${response}=    Login Invalido
    Verificar Erro De Autenticacao    ${response}    400

Login sem usuário deve retornar erro
    [Tags]    negativo    campo_obrigatorio
    ${response}=    Login Sem Usuario
    Verificar Erro De Autenticacao    ${response}    400

Login sem senha deve retornar erro
    [Tags]    negativo    campo_obrigatorio
    ${response}=    Login Sem Senha
    Verificar Erro De Autenticacao    ${response}    400

Usuário com token inválido deve retornar erro
    [Tags]    negativo    bearer_token
    ${response}=    Consultar Usuario Com Token Invalido
    Verificar Erro De Autenticacao    ${response}    401

Usuário sem token deve retornar erro
    [Tags]    negativo    bearer_token
    ${response}=    Consultar Sem Token
    Verificar Erro De Autenticacao    ${response}    401
