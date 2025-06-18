# 🕒 3D Analog Clock

A beautiful, interactive 3D analog clock built with React and Three.js. Customize colors, sizes, and watch time tick by in real-time with a dynamic favicon that mirrors your clock settings!

## ✨ Features

- **3D Rendered Clock**: Built with React Three Fiber for smooth 3D graphics
- **Real-time Updates**: Clock hands move continuously to show the current time
- **Interactive Controls**: Customize colors and sizes with an intuitive control panel
- **Dynamic Favicon**: The browser tab icon shows a mini version of your customized clock
- **URL Configuration**: Share your clock settings with others via URL parameters
- **Responsive Design**: Works great on desktop and mobile devices

## 🚀 Live Demo

Check out the live version: [https://corychainsman.github.io/clock/](https://corychainsman.github.io/clock/)

## 🎨 Customization

Use the control panel on the right to customize:

- **Clock Hands**: Change colors and lengths for hour, minute, and second hands
- **Hand Circles**: Add decorative circles at the end of hands with customizable size and style
- **Clock Face**: Modify background color and number styling
- **Radii Settings**: Adjust the positioning of numbers and tick marks

## 🔗 URL Sharing

Your customizations are automatically saved to the URL! Share your custom clock design by copying the URL from your browser's address bar.

Example: `?hourHandColor=ff0000&minuteHandColor=00ff00&secondHandColor=0000ff`

## 🛠️ Development

Want to run this locally or contribute? Here's how:

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Getting Started

```bash
# Clone the repository
git clone https://github.com/corychainsman/clock.git
cd clock

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🏗️ Built With

- **React** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics via React Three Fiber
- **Vite** - Build tool and dev server
- **Tweakpane** - Interactive control panel

## 🎯 Technical Details

The clock uses an orthographic camera for a clean 2D appearance while leveraging 3D positioning for smooth animations. All clock elements are rendered using Three.js geometries:

- Clock face: CircleGeometry with customizable background
- Clock hands: BoxGeometry with real-time rotation based on current time
- Numbers and tick marks: Positioned using polar coordinates
- Dynamic favicon: Canvas-based rendering that updates every second

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs by opening an issue
- Suggest new features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Favicon generation inspired by canvas-based rendering techniques
- GitHub corner by [Tim Holman](https://github.com/tholman/github-corners)
- Built with the amazing React Three Fiber ecosystem

---

*Made with ❤️ and Three.js*