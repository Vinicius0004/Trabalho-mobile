*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    ../file/libraries/CPFGenerator.py

Resource    actions/actions.robot
Resource    variables.robot
Resource    cadastroBuger/cadastroBuger.robot
Resource    generic/generic.robot

*** Keywords ***
Abrir navegador
    ${OPTIONS}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver

    ${REMOTE_URL}=    Get Environment Variable    REMOTE_URL    ${EMPTY}

    IF    "${REMOTE_URL}" == "''"

        Open Browser    about:blank    ${BROWSER}    options=${OPTIONS}
    
    ELSE

        Open Browser    about:blank    ${BROWSER}    remote_url=${REMOTE_URL}    options=${OPTIONS}
        
    END
    
    Maximize Browser Window

Fechar navegador

    Close Browser