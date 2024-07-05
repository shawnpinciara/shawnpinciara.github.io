title = "Dewi"
text = '''
Wind instruments are physically limited of having the holes in strict positions to achieve the sound of the instrument. This limitation was not overcome with electronic wind instruments, as the current standard in the market is still to replicate the acoustic ones.
That’s why the DEWI was born, to experiment both finger positioning and finger mapping for the notes, efficiently decreasing the number of buttons needed (the instrument could work just with 7 buttons for 4 octaves without the 4 buttons to change key).
'''
img = "./src/dewi_sketch.jpg"

tab = '''
<!-- '''+title+''' -->
<div class="flex lg:flex-row flex-col-reverse mt-10">
    <div class="flex-grow flex flex-col pl-0 lg:pl-4 pt-4 lg:pt-0">
        <h1 class="h1_title">'''+title+'''</h1>
        <p>'''+text+'''</p>
    </div>
    <div class="flex-grow rounded-md h-60 bg-[url('./')] bg-no-repeat bg-cover bg-center bg-scroll"></div>  
</div>'''

print(tab)