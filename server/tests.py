import optparse




def controller(url):
    pass

if __name__ == '__main__':
    #parse command line arguments
    parser = optparse.OptionParser(usage="%prog ServerHost")
    options, args = parser.parse_args()
    if len(args) < 1:
        parser.error("No host specified")
    else:
        url = args[0]
        controller(url)