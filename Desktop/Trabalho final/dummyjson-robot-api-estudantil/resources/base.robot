*** Settings ***
Documentation     Configurações principais usadas nos testes da API DummyJSON.
Library           RequestsLibrary
Library           Collections
Library           String

*** Variables ***
${BASE_URL}              https://dummyjson.com
${USERNAME_VALIDO}       emilys
${PASSWORD_VALIDO}       emilyspass
${USERNAME_INVALIDO}     usuario_teste_invalido
${PASSWORD_INVALIDO}     senha_teste_invalida
${TOKEN_INVALIDO}        token_invalido_123
${PRODUTO_ID_VALIDO}     1
${PRODUTO_ID_INVALIDO}   999999
${TIMEOUT}               15

*** Keywords ***
Criar Sessao Da API
    [Documentation]    Abre a sessão HTTP usada nos testes.
    ${headers}=    Create Dictionary    Content-Type=application/json
    Create Session    dummyjson    ${BASE_URL}    headers=${headers}    timeout=${TIMEOUT}    verify=True

Converter Resposta Para Json
    [Documentation]    Converte a resposta da API para JSON.
    [Arguments]    ${response}
    ${json}=    Set Variable    ${response.json()}
    RETURN    ${json}

Conferir Status Code
    [Documentation]    Compara o status retornado com o esperado.
    [Arguments]    ${response}    ${status_esperado}
    Should Be Equal As Integers    ${response.status_code}    ${status_esperado}

Conferir Campo No Json
    [Documentation]    Verifica se um campo existe no JSON retornado.
    [Arguments]    ${json}    ${campo}
    Dictionary Should Contain Key    ${json}    ${campo}

Conferir Campos No Json
    [Documentation]    Verifica uma lista de campos no JSON retornado.
    [Arguments]    ${json}    @{campos}
    FOR    ${campo}    IN    @{campos}
        Conferir Campo No Json    ${json}    ${campo}
    END

Conferir Campo Preenchido
    [Documentation]    Verifica se o campo existe e possui algum valor.
    [Arguments]    ${json}    ${campo}
    Dictionary Should Contain Key    ${json}    ${campo}
    ${valor}=    Get From Dictionary    ${json}    ${campo}
    Should Not Be Empty    ${valor}

Montar Header Com Token
    [Documentation]    Monta o header Authorization para rotas autenticadas.
    [Arguments]    ${token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    RETURN    ${headers}

Gerar Nome De Produto
    [Documentation]    Gera um nome simples e variável para massa de teste.
    ${codigo}=    Generate Random String    6    [LETTERS][NUMBERS]
    ${nome}=    Set Variable    Produto Teste ${codigo}
    RETURN    ${nome}

Montar Produto Para Cadastro
    [Documentation]    Monta uma massa dinâmica para o POST de produto.
    ${titulo}=    Gerar Nome De Produto
    ${payload}=    Create Dictionary
    ...    title=${titulo}
    ...    description=Produto criado durante a execução do teste
    ...    price=120
    ...    stock=15
    ...    brand=Teste QA
    ...    category=testing
    RETURN    ${payload}
