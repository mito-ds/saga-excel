# Installer Scripts

These scripts build an installer for the Saga Excel Add-in. The installer only works for Mac, currently, and can be build with:

```
python3 create_installer.py
```

It will generate a signed, notarized installer under the `SagaInstaller.pkg`. Notably, this can only be run by Nate currently, as it requires his credentials; he's not willing to share them, sorry.