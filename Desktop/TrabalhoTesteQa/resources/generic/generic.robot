*** Settings ***
Resource    ../base.robot

*** Keywords ***
Gerar cpf aleatório

    ${CPF}=    Gerar Cpf

    Set Test Variable      ${CPF}