*** Settings ***
Documentation     Palavras-chave dos testes de autenticação para a API DummyJSON.
Resource          ../base.robot
Resource          rotas.robot

*** Keywords ***
Realizar Login
    [Documentation]    Realiza login com usuário e senha informados.
    [Arguments]    ${username}    ${password}    ${status_esperado}=any
    ${payload}=    Create Dictionary    username=${username}    password=${password}    expiresInMins=30
    ${response}=    POST On Session    dummyjson    ${ROTA_LOGIN}    json=${payload}    expected_status=${status_esperado}
    RETURN    ${response}

Login Valido
    [Documentation]    Realiza login usando credenciais válidas.
    ${response}=    Realizar Login    ${USERNAME_VALIDO}    ${PASSWORD_VALIDO}    200
    RETURN    ${response}

Login Invalido
    [Documentation]    Tenta login com credenciais inválidas.
    ${response}=    Realizar Login    ${USERNAME_INVALIDO}    ${PASSWORD_INVALIDO}
    RETURN    ${response}

Login Sem Usuario
    [Documentation]    Tenta login sem enviar o campo username.
    ${payload}=    Create Dictionary    password=${PASSWORD_VALIDO}
    ${response}=    POST On Session    dummyjson    ${ROTA_LOGIN}    json=${payload}    expected_status=any
    RETURN    ${response}

Login Sem Senha
    [Documentation]    Tenta login sem enviar o campo password.
    ${payload}=    Create Dictionary    username=${USERNAME_VALIDO}
    ${response}=    POST On Session    dummyjson    ${ROTA_LOGIN}    json=${payload}    expected_status=any
    RETURN    ${response}

Extrair Access Token
    [Documentation]    Extrai o accessToken da resposta de login.
    [Arguments]    ${response}
    ${json}=    Converter Resposta Para JSON    ${response}
    ${token}=    Get From Dictionary    ${json}    accessToken
    RETURN    ${token}

Consultar Usuario Logado
    [Documentation]    Consulta a rota /auth/me com token válido.
    [Arguments]    ${token}
    ${headers}=    Criar Header Com Token    ${token}
    ${response}=    GET On Session    dummyjson    ${ROTA_USUARIO_LOGADO}    headers=${headers}    expected_status=any
    RETURN    ${response}

Consultar Usuario Com Token Invalido
    [Documentation]    Consulta a rota /auth/me usando token inválido.
    ${headers}=    Criar Header Com Token    ${TOKEN_INVALIDO}
    ${response}=    GET On Session    dummyjson    ${ROTA_USUARIO_LOGADO}    headers=${headers}    expected_status=any
    RETURN    ${response}

Consultar Sem Token
    [Documentation]    Consulta a rota /auth/me sem enviar token.
    ${response}=    GET On Session    dummyjson    ${ROTA_USUARIO_LOGADO}    expected_status=any
    RETURN    ${response}

Verificar Login Com Sucesso
    [Documentation]    Verifica o retorno de um login bem-sucedido.
    [Arguments]    ${response}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    id    username    email    firstName    lastName    accessToken    refreshToken
    Verificar Campo Preenchido    ${json}    accessToken
    Should Be Equal    ${json}[username]    ${USERNAME_VALIDO}

Verificar Usuario Logado
    [Documentation]    Verifica os dados do usuário autenticado.
    [Arguments]    ${response}
    Verificar Status Code    ${response}    200
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campos No JSON    ${json}    id    username    email    firstName    lastName
    Should Be Equal    ${json}[username]    ${USERNAME_VALIDO}

Verificar Erro De Autenticacao
    [Documentation]    Verifica o erro retornado pela API de autenticação.
    [Arguments]    ${response}    ${status_esperado}
    Verificar Status Code    ${response}    ${status_esperado}
    ${json}=    Converter Resposta Para JSON    ${response}
    Verificar Campo Preenchido    ${json}    message
