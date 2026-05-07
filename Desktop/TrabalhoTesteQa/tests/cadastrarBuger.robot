*** Settings ***
Resource    ../resources/base.robot

Test Setup        Abrir navegador
Test Teardown     Fechar navegador

*** Test Cases ***
Cadastrar buger eats entregas
    [Tags]    Cadastrar_Entregas

    Abrir url    ${URL_BUGER}    
    Clicar no texto    Cadastre-se para fazer entregas
    Verificar se a tela de cadastro é exibida
    Informar os dados do entregador    Teste Teste    email@teste   48983723024    
    Informar os dados de endereço    88804-400    900    Em Frente Academia
    Definir método de entrega    Moto
    Fazer upload da cnh
    Cadastrar o entregador
    Verificar se o cadastro foi realizado com sucesso

Cadastrar buger eats entregas com outras informações
    [Tags]    Cadastrar_Entregas

    Abrir url    ${URL_BUGER}    
    Clicar no texto    Cadastre-se para fazer entregas
    Verificar se a tela de cadastro é exibida
    Informar os dados do entregador    Junior    email@teste.com.br   48983723024    
    Informar os dados de endereço    88804-320    90    Perto da Padaria
    Definir método de entrega    Bicicleta
    Fazer upload da cnh
    Cadastrar o entregador
    Verificar se o cadastro foi realizado com sucesso

Validar se não permite cadastrar sem as informações do entregador
    [Tags]    Validar_Cadastro_Sem_Informacoes    Cadastrar_Entregas

    Abrir url    ${URL_BUGER}    
    Clicar no texto    Cadastre-se para fazer entregas
    Verificar se a tela de cadastro é exibida
    Informar os dados de endereço    88804-320    90    Perto da Padaria
    Definir método de entrega    Bicicleta
    Fazer upload da cnh
    Cadastrar o entregador
    Verificar mensagem de validação na tela    É necessário informar o nome
    Verificar mensagem de validação na tela    É necessário informar o CPF
    Verificar mensagem de validação na tela    É necessário informar o email