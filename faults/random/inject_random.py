import random
import subprocess
from pathlib import Path


FAULTS = [
    "default_route",
    "static_route",
    #"web_stop",
    #"dns_config"
]


def inject_fault():

    selected = random.choice(FAULTS)

    script = Path(
        f"../{selected}/inject.sh"
    )

    print(f"Injecting fault: {selected}")

    subprocess.run(
        [str(script)],
        check=True
    )

    return selected


if __name__ == "__main__":
    inject_fault()
