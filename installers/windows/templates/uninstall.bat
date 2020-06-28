:: Simple Windows installer for Saga
@echo off 

ECHO Removing self from trust registry
reg delete HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{0ee5f519-2a2d-4adb-9f49-511140f03a96} /f

Echo Unsharing folders
net share Manifest /delete


ECHO Deleting folders
del /Q C:\Saga


ECHO Saga is uninstalled. Thanks for playing!