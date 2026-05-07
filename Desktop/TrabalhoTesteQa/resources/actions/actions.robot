*** Settings ***
Resource    ../base.robot

*** Keywords ***
Aguardar por segundos
     [Arguments]    ${SEGUNDOS}

     Sleep    ${SEGUNDOS}

Abrir url
    [Arguments]    ${URL}

    Go To    ${URL}

Clicar no texto
    [Arguments]    ${TEXTO}

    Click Element    xpath=//*[contains(text(), "${TEXTO}")]

Aguardar elemento com o texto presente
    [Arguments]    ${TEXTO}

    Wait Until Element Is Visible    xpath=//*[contains(text(), "${TEXTO}")]

Digitar os dados no elemento
    [Arguments]    ${ELEMENTO}    ${TEXTO}
    
    Input Text    ${ELEMENTO}    ${TEXTO}

Clicar no botão
    [Arguments]    ${BOTAO}

    Click Button    ${BOTAO}

Fazer upload de imagem
    [Arguments]    ${ELEMENTO}    ${IMAGE}

    Choose File    ${ELEMENTO}    ${IMAGE}   

Pressionar a tecla
    [Arguments]    ${TECLA}

    Press Keys    ${TECLA}