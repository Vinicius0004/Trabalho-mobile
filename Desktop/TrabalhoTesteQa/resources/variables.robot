*** Settings ***
Resource    base.robot

*** Variables ***
${BROWSER}          chrome
${URL_BUGER}        https://buger-eats.vercel.app/
${URL_AMAZON}       https://www.amazon.com.br/?&tag=hydrbrabk-20&ref=pd_sl_7rwd1q78df_e&adgrpid=155790195778&hvpone=&hvptwo=&hvadid=677606588104&hvpos=&hvnetw=g&hvrand=13377014302277781175&hvqmt=e&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9215642&hvtargid=kwd-10573980&hydadcr=26346_11691057&gad_source=1

# MAPEAMENTOS DE ELEMENTOS
${CAMPO_NOME}           name=name
${CAMPO_CPF}            name=cpf
${CAMPO_EMAIL}          xpath=//*[@type='email']
${CAMPO_WHATSAPP}       name=whatsapp
${CAMPO_CEP}            name=postalcode
${CAMPO_NUMERO}         name=address-number
${CAMPO_COMPLEMENTO}    name=address-details
${UPLOAD_IMAGE}         xpath=//input[@type="file"]