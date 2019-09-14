from PIL import Image, ImageFilter, ImageDraw

#Image Generator for cards in pile
print("hello world")

suite = {"S": "1", "D": "2", "C": "3", "H": "4"}
num = { "A":"1", "J":"11", "Q":"12", "K":"13"}

#White box corner: 43, 47
circ_index = [1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,4,4,4,5,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,26,27,29,32,35,39,43,43]
circ_index.reverse()

#Crops image and converts to .png
def editImage(n, s):
    #Get the image files
    img = Image.open("./public/input/"+n+s+".jpg")
    new = Image.new('RGBA', (img.size), color=(255, 255, 255, 0))
    newpixels = new.load()
    oldpixels = img.load()

    #Translate and trim pixels from source
    for x in range(img.size[0]):
        for y in range(img.size[1]):
            if y > 1 and y < img.size[1] - 2 and x > 1 and x < img.size[0] - 5:
                cancelprint = False
                if y < 44:
                    if x < circ_index[y - 2] or x > img.size[0] - circ_index[y - 2]:
                        cancelprint = True

                elif y > img.size[1] - 45:
                    if x < circ_index[img.size[1] - y - 3] or x > img.size[0] - circ_index[img.size[1] - y - 3]:
                        cancelprint = True

                if cancelprint == False:
                    newpixels[x, y] = (255 - oldpixels[x, y][0], 255 - oldpixels[x, y][1], 255 - oldpixels[x, y][2], 255)

    #Save new image file
    new.save("./public/cards/"+suite[s]+"_"+num[n]+".png")
    new.close()
    img.close()

#Execution code
for s in range(2, 11):
    num[str(s)] = str(s)

for s in suite:
    print('Creating Suite: ' + s)
    for n in num:
        print('Card: ' + n+s)
        editImage(n, s)
