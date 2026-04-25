import tkinter as tk

class Cuadro(tk.Canvas):
    def __init__(self, master, width=100, height=100, **kwargs):
        super().__init__(master, width=width, height=height, **kwargs)
        self.width = width
        self.height = height
        self.create_rectangle(0, 0, width, height, fill="blue", outline="black")

    def moveleft(self, *args):
        self.move("all", -10, 0)
    
    def moveright(self, *args):
        self.move("all", 10, 0)

def posicion_cuadro(cuadro):
    coords = cuadro.coords(1)  
    print(coords[0], coords[1])  # Obtener las coordenadas del rectángulo
    return coords[0], coords[1]  # Retornar la posición (x, y)

if __name__ == "__main__":
    print("Iniciando aplicación de cuadro...")
    print("hello world")
    root = tk.Tk()

    root.geometry("500x300")
    
    root.title("Cuadro")
    canvas = tk.Canvas(root, width=400, height=400)
    
    cuadro = canvas.create_rectangle(50, 50, 150, 150, fill="blue", outline="black")
    canvas.pack()

    posicion_cuadro(canvas)

    root.bind("<Left>", lambda event: canvas.move(cuadro, -10, 0))
    root.bind("<Right>", lambda event: canvas.move(cuadro, 10, 0))
    root.mainloop()