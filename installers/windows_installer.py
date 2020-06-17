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



def create_windows_installer():
    """
    Creates, signs, and staples a notarization to a installer for Mac.

    All of the intermediate build information is created in build/intermediate/mac,
    and then is deleted at the end of this function.
    """

    intermediate_build_folder = "./dist/intermediate"
    intermediate_build_folder_windows = "./dist/intermediate/windows"

    # Clean up any intermediate paths
    if os.path.exists(intermediate_build_folder):
        shutil.rmtree(intermediate_build_folder)

    os.mkdir(intermediate_build_folder)
    os.mkdir(intermediate_build_folder_windows)

    # For now, we just write the installer out
    installer_package = "./dist/SagaInstallerWindows.bat"

    # read in the current manifest data
    with open("./dist/saga.manifest.xml", "r") as f:
        manifest_data = f.read()

    if "localhost:3000" in manifest_data:
        print("Error: localhost in manifest data. Are you building correctly?")
        exit(1)
    
    # write it to the build folder
    with open("./windows/templates/install.bat", "r") as f:
        install_data = str(Template(f.read()).safe_substitute(manifest=manifest_data))
        with open(installer_package, "w+") as installer:
            installer.write(install_data)
    print("Created")