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



def create_mac_installer():
    """
    Creates, signs, and staples a notarization to a installer for Mac.

    All of the intermediate build information is created in build/intermediate/mac,
    and then is deleted at the end of this function.
    """

    intermediate_build_folder = "./dist/intermediate"
    intermediate_build_folder_mac = "./dist/intermediate/mac"

    # Clean up any intermediate paths
    if os.path.exists(intermediate_build_folder):
        shutil.rmtree(intermediate_build_folder)

    os.mkdir(intermediate_build_folder)
    os.mkdir(intermediate_build_folder_mac)


    # Save the file names of the intermediate and final files
    install_scripts_folder = f"{intermediate_build_folder_mac}/saga-installer"
    intermediate_install_package = f"{intermediate_build_folder_mac}/InstallScripts.pkg"
    distribution_plist = f"{intermediate_build_folder_mac}/distribution.plist"
    install_package = f"{intermediate_build_folder_mac}/Saga.pkg"
    signed_installer_package = "./dist/SagaInstallerMac.pkg"

    # read in the current manifest data
    with open("./dist/saga.manifest.xml", "r") as f:
        manifest_data = f.read()

    if "localhost:3000" in manifest_data:
        print("Error: localhost in manifest data. Are you building correctly?")
        exit(1)
    
    # write it 
    with open("./mac/templates/preinstall", "r") as f:
        preinstall_data = str(Template(f.read()).safe_substitute(manifest=manifest_data))
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
    out, err = run_process_exit_on_error(
        [
            "pkgbuild", 
            "--scripts", install_scripts_folder,
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
    with open('./mac/secrets.txt', 'r') as f:
        username = f.readline().strip()
        password = f.readline().strip()

    print(username, password)

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
    print(f"Got uuid: {uuid}")

    response = False
    print("Waiting for response...", end="")
    while not response:
        out, err = run_process_exit_on_error(
            [
                "xcrun", "altool", "--notarization-info", uuid, 
                "-u", username,
                "-p", password
            ]
        )
        print(out)
        status_line = list(filter(lambda l: "Status" in l, out.split("\n")))[0]
        if "in progress" in status_line:
            print(".", end='', flush=True)
            time.sleep(30)
        else:
            response = True

    print(f"\nResponse is: {status_line}")

    # Then, we try and stable this notarization onto the signed package
    out = run_process_exit_on_error(
        [
            "xcrun", "stapler", "staple",
            signed_installer_package
        ]
    )
    print(out)