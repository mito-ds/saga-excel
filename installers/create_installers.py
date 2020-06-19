import shutil
import os
from mac_installer import create_mac_installer 
from windows_installer import create_windows_installer

def main():

    # First, we cleanup the last build
    if os.path.exists("./dist"):
        shutil.rmtree("./dist")
    os.mkdir("./dist")

    # First, we build turn the manifest into a production build
    with open("../manifest.xml", "r") as f:
        manifest_data = f.read()
    
    manifest_data = manifest_data.replace("localhost:3000", "excel.sagacollab.com")

    with open("./dist/saga.manifest.xml", "w+") as f:
        f.write(manifest_data)

    # Then, we first build the mac installer
    print("Creating the installer for Mac:")
    create_mac_installer()


    # Next, we build the PC installer
    print("Creating an installer for Windows:")
    create_windows_installer()
    print("Finished!")



if __name__ == "__main__":
    main()