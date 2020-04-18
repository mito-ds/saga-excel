import os
import time
import shutil
import subprocess
from string import Template

def run_process(command):
    out = subprocess.Popen(command, 
           stdout=subprocess.PIPE, 
           stderr=subprocess.STDOUT)

    stdout, stderr = out.communicate()
    if stdout is not None:
        stdout = stdout.decode("utf-8")
    if stderr is not None:
        stderr = stderr.decode("utf-8")
    
    return stdout, stderr

def run_process_exit_on_error(command):
    out = subprocess.Popen(command, 
           stdout=subprocess.PIPE, 
           stderr=subprocess.STDOUT)

    stdout, stderr = out.communicate()
    if stdout is not None:
        stdout = stdout.decode("utf-8")
    if stderr is not None:
        stderr = stderr.decode("utf-8")
        print(f"Error: command {command} exited with output {stdout} and error {stderr}")
        exit(1)
        
    return stdout, stderr

def remove(paths):
    for path in paths:
        if os.path.exists(path):
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)



def main():

    # If you change any, don't forget to change them in the gitignore too!
    install_scripts_folder = "saga-installer/"
    intermediate_install_package = "./InstallScripts.pkg"
    distribution_plist = "./distribution.plist"
    install_package = "./Saga.pkg"
    signed_installer_package = "SagaInstaller.pkg"

    # First, we remove all the old packages that might be hanging around
    remove([
        install_scripts_folder, 
        intermediate_install_package, 
        distribution_plist, 
        install_package, 
        signed_installer_package
    ])

    print("Copying over the current manifest for the install scripts...")

    # read in the current manifest data
    with open("../manifest.xml", "r") as f:
        manifest_data = f.read()

    # write it 
    with open("./templates/preinstall", "r") as f:
        preinstall_data = str(Template(f.read()).safe_substitute(manifest=manifest_data))
        if "localhost" in preinstall_data:
            print("Localhost is in the manifest file. Is this intended? ")
        os.mkdir(install_scripts_folder)
        with open(os.path.join(install_scripts_folder, "preinstall"), "w+") as preinstall_f:
            preinstall_f.write(preinstall_data)
    

    # Then, we set the permissions on the install scripts to the correct value
    run_process_exit_on_error(
        [
            "chmod", 
            '-R',
            "u+x",
            install_scripts_folder
        ]
    )

    print("Building the package...")

    # Build the package with 
    run_process_exit_on_error(
        [
            "pkgbuild", 
            "--scripts", "saga-installer/",
            "--nopayload",
            "--identifier", "saga-vcs",
            intermediate_install_package
        ]
    )

    # sync the distribution plist
    run_process_exit_on_error(
        [
            "productbuild", 
            "--synthesize",
            "--package", intermediate_install_package,
            "--version", "1.0",
            distribution_plist
        ]
    )

    # actually build the product
    run_process_exit_on_error(
        [
            "productbuild", 
            "--distribution", distribution_plist,
            "--package-path", intermediate_install_package,
            install_package
        ]
    )

    # Sign the product with my developer id
    run_process_exit_on_error(
        [
            "productsign", 
            "--sign", "Developer ID Installer: Nathan Rush (BLG85RWS85)",
            "--timestamp", # include a trusted timestamp
            install_package,
            signed_installer_package
        ]
    )

    # Read in the saved apple developer credentials
    # NOTE: password must be a app-specific password, rather than 
    # your actual sign in credentials.
    with open('secrets.txt', 'r') as f:
        username = f.readline().strip()
        password = f.readline().strip()

    # Send the .pkg to apple to run 
    print("Starting notarization...")
    out, err = run_process_exit_on_error(
        [
            "xcrun", "altool", "--notarize-app",
            "--primary-bundle-id", "signed.saga.pkg",
            "--username", username,
            "--password", password,
            "--file", signed_installer_package
        ]
    )
    uuid = out.split("\n")[1].split("=")[1].strip()

    response = False
    print("Waiting for response...", end="")
    while not response:
        out, err = run_process_exit_on_error(
            [
                "xcrun", "altool", "--notarization-history",
                "-u", username,
                "-p", password
            ]
        )
        line = list(filter(lambda l: uuid in l, out.split("\n")))[0]
        if "in progress" in line:
            print(".", end='', flush=True)
            time.sleep(30)
        else:
            response = True

    print(f"\nResponse is: {line}")

    # Then, we try and stable this notarization onto the signed package
    run_process_exit_on_error(
        [
            "xcrun", "stapler", "staple",
            signed_installer_package
        ]
    )

if __name__ == "__main__":
    main()