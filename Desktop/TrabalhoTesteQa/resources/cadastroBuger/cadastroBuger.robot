*** Settings ***
Resource    ../base.robot

*** Keywords ***
Verificar se a tela de cadastro é exibida

    Aguardar elemento com o texto presente    Dados   
    
Informar os dados do entregador
    [Arguments]    ${NOME}    ${EMAIL}    ${TELEFONE}

    Gerar cpf aleatório
    
    Digitar os dados no elemento    ${CAMPO_NOME}        ${NOME}
    Digitar os dados no elemento    ${CAMPO_CPF}         ${CPF}
    Digitar os dados no elemento    ${CAMPO_EMAIL}       ${EMAIL}
    Digitar os dados no elemento    ${CAMPO_WHATSAPP}    ${TELEFONE}

Informar os dados de endereço
    [Arguments]    ${CEP}    ${NUMERO}    ${COMPLEMENTO}

    Digitar os dados no elemento    ${CAMPO_CEP}    ${CEP}
    Clicar no botão    Buscar CEP
    Digitar os dados no elemento    ${CAMPO_NUMERO}         ${NUMERO}
    Digitar os dados no elemento    ${CAMPO_COMPLEMENTO}    ${COMPLEMENTO}

Definir método de entrega
    [Arguments]    ${METODO_ENTREGA}

    Clicar no texto     ${METODO_ENTREGA}

Fazer upload da cnh

    Fazer upload de imagem    ${UPLOAD_IMAGE}    ${EXECDIR}/file/images/dog.jpg

Cadastrar o entregador
    
    Clicar no botão    Cadastre-se para fazer entregas

Verificar se o cadastro foi realizado com sucesso

    Aguardar elemento com o texto presente    Recebemos os seus dados. Fique de olho na sua caixa de email, pois e em breve retornamos o contato.

Verificar mensagem de validação na tela
    [Arguments]    ${MENSAGEM}

    Aguardar elemento com o texto presente    ${MENSAGEM}

    