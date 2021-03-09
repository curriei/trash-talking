import optparse
import requests
from os.path import join
import unittest

class TestUserModules(unittest.TestCase):
    def __init__(self, url):
        super().__init__()
        self.url = url

    def test_create_user(self):
        create_url = join(self.url, 'users/new')
        # Normal request
        user_1_data = {}
        r = requests.post(create_url, data=user_1_data)
        

def controller(url):
    pass

if __name__ == '__main__':
    #parse command line arguments
    parser = optparse.OptionParser(usage="%prog ServerHost")
    options, args = parser.parse_args()
    url = ""
    if len(args) < 1:
        print("No host specified, using standard google url")
        url = "https://trash-talking-mksvgldida-uc.a.run.app/"
    else:
        url = args[0]
    controller(url)