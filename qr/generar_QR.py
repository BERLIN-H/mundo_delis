import qrcode
from PIL import Image, ImageDraw, ImageFont

# URL
url = "https://berlin-h.github.io/mundo_delis/"

# Crear QR
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4
)

qr.add_data(url)
qr.make(fit=True)

qr_img = qr.make_image(fill_color="black", back_color="white")
qr_img = qr_img.convert("RGB")

# Tamaño final
ancho = 500
alto = 650

fondo = Image.new("RGB", (ancho, alto), "#F5F1EC")

# Centrar QR
qr_img = qr_img.resize((380, 380))
x_qr = (ancho - 380) // 2
fondo.paste(qr_img, (x_qr, 40))

draw = ImageDraw.Draw(fondo)

# Línea rosada
draw.line(
    [(40, 470), (460, 470)],
    fill="#E8A8B8",
    width=3
)

# Fuentes
try:
    titulo = ImageFont.truetype("times.ttf", 30)
    subtitulo = ImageFont.truetype("arial.ttf", 18)
except:
    titulo = ImageFont.load_default()
    subtitulo = ImageFont.load_default()

# Texto principal
texto1 = "Mundo Delis Repostería"
bbox = draw.textbbox((0, 0), texto1, font=titulo)
w = bbox[2] - bbox[0]

draw.text(
    ((ancho - w) / 2, 490),
    texto1,
    fill="#B88A3B",
    font=titulo
)

# Texto secundario
texto2 = "Escanea para ver el menú"
bbox = draw.textbbox((0, 0), texto2, font=subtitulo)
w = bbox[2] - bbox[0]

draw.text(
    ((ancho - w) / 2, 540),
    texto2,
    fill="#7A6A6A",
    font=subtitulo
)

# Guardar
fondo.save("MundoDelisQR.png")

print("Imagen creada: MundoDelisQR.png")