:: Simple Windows installer for Saga
@echo off 

:: First, we get the hostname of the computer, so we know where we are installing
FOR /F "tokens=* USEBACKQ" %%F IN (`hostname`) DO (
SET hostname=%%F
)
ECHO Installing Saga on %hostname%

:: Then, we make a folder for all saga related things
:: and put the manifest in that folder
ECHO Creating the Saga folder
md C:\Saga
md C:\Saga\Manifest


:: Next, copy the manifest to the manifest folder, using code found: https://stackoverflow.com/questions/1015163/heredoc-for-windows-batchs
call :heredoc manifest > C:\Saga\Manifest\saga.manifest.xml && goto next1
$manifest
:next1


:: Then, we share the registry folder
net share Manifest=C:\Saga\Manifest


:: We then create a file for editing the trust registry
call :heredoc registry > C:\Saga\SagaTrustRegistry.reg && goto next2
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{0ee5f519-2a2d-4adb-9f49-511140f03a96}]
"Id"="{0ee5f519-2a2d-4adb-9f49-511140f03a96}"
"Url"="\\\\!hostname!\\Manifest"
"Flags"=dword:00000001
:next2

:: Finially, we import this into the trust registry
echo Adding Saga to Excel
REG IMPORT C:\Saga\SagaTrustRegistry.reg

:: Print out some helpful ending messages
echo Installation is finished. You can now restart Excel, and insert Saga.

:: Taken from https://stackoverflow.com/questions/1015163/heredoc-for-windows-batch
:heredoc <uniqueIDX>
setlocal enabledelayedexpansion
set go=
for /f "delims=" %%A in ('findstr /n "^" "%~f0"') do (
    set "line=%%A" && set "line=!line:*:=!"
    if defined go (if #!line:~1!==#!go::=! (goto :EOF) else echo(!line!)
    if "!line:~0,13!"=="call :heredoc" (
        for /f "tokens=3 delims=>^ " %%i in ("!line!") do (
            if #%%i==#%1 (
                for /f "tokens=2 delims=&" %%I in ("!line!") do (
                    for /f "tokens=2" %%x in ("%%I") do set "go=%%x"
                )
            )
        )
    )
)
goto :EOF
