*** Settings ***
Documentation     Keywords dos testes de autenticação.
Resource          ../base.robot
Resource          rotas.robot

*** Keywords ***
Fazer Login
    [Documentation]    Realiza login com o usuário e senha recebidos 
    [Arguments]    ${username}    ${password}    ${status_esperado}=any
    ${payload}=    Create Dictionary    username=${username}    password=${password}    expiresInMins=30
    ${response}=    POST On Session    dummyjson    ${ROTA_LOGIN}    json=${payload}    expected_status=${status_esperado}
    RETURN    ${response}

Fazer Login Valido
    [Documentation]    Login positivo usando usuário válido da DummyJSON
    ${response}=    Fazer Login    ${USERNAME_VALIDO}    ${PASSWORD_VALIDO}    200
    RETURN    ${response}

Fazer Login Invalido
    [Documentation]    Login negativo com usuário e senha inválidos
    ${response}=    Fazer Login    ${USERNAME_INVALIDO}    ${PASSWORD_INVALIDO}
    RETURN    ${response}

Fazer Login Sem Username
    [Documentation]    Envia login sem o campo username
    ${payload}=    Create Dictionary    password=${PASSWORD_VALIDO}
    ${response}=    POST On Session    dummyjson    ${ROTA_LOGIN}    json=${payload}    expected_status=any
    RETURN    ${response}

Fazer Login Sem Password
    [Documentation]    Envia login sem o campo password
    ${payload}=    Create Dictionary    username=${USERNAME_VALIDO}
    ${response}=    POST On Session    dummyjson    ${ROTA_LOGIN}    json=${payload}    expected_status=any
    RETURN    ${response}

Pegar Access Token
    [Documentation]    Retira o accessToken da resposta do login
    [Arguments]    ${response}
    ${json}=    Converter Resposta Para Json    ${response}
    ${token}=    Get From Dictionary    ${json}    accessToken
    RETURN    ${token}

Buscar Usuario Logado
    [Documentation]    Consulta a rota /auth/me com Bearer Token
    [Arguments]    ${token}
    ${headers}=    Montar Header Com Token    ${token}
    ${response}=    GET On Session    dummyjson    ${ROTA_USUARIO_LOGADO}    headers=${headers}    expected_status=any
    RETURN    ${response}

Buscar Usuario Com Token Invalido
    [Documentation]    Consulta a rota /auth/me usando token inválido
    ${headers}=    Montar Header Com Token    ${TOKEN_INVALIDO}
    ${response}=    GET On Session    dummyjson    ${ROTA_USUARIO_LOGADO}    headers=${headers}    expected_status=any
    RETURN    ${response}

Buscar Usuario Sem Enviar Token
    [Documentation]    Consulta a rota /auth/me sem autenticação
    ${response}=    GET On Session    dummyjson    ${ROTA_USUARIO_LOGADO}    expected_status=any
    RETURN    ${response}

Validar Login Com Sucesso
    [Documentation]    Valida retorno de login com sucesso
    [Arguments]    ${response}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    id    username    email    firstName    lastName    accessToken    refreshToken
    Conferir Campo Preenchido    ${json}    accessToken
    Should Be Equal    ${json}[username]    ${USERNAME_VALIDO}

Validar Usuario Logado
    [Documentation]    Valida os dados básicos do usuário autenticado
    [Arguments]    ${response}
    Conferir Status Code    ${response}    200
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campos No Json    ${json}    id    username    email    firstName    lastName
    Should Be Equal    ${json}[username]    ${USERNAME_VALIDO}

Validar Retorno De Erro
    [Documentation]    Valida erros de autenticação
    [Arguments]    ${response}    ${status_esperado}
    Conferir Status Code    ${response}    ${status_esperado}
    ${json}=    Converter Resposta Para Json    ${response}
    Conferir Campo Preenchido    ${json}    message
