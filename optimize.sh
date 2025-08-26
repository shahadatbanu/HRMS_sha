#!/bin/bash

echo "🚀 Starting React Performance Optimization..."

# 1. Clean up dependencies
echo "📦 Cleaning up heavy dependencies..."
npm uninstall @fortawesome/fontawesome-free @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
npm uninstall @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/react @fullcalendar/timegrid
npm uninstall @hello-pangea/dnd @react-latest-ui/react-sticky-notes
npm uninstall apexcharts react-apexcharts react-awesome-stars-rating
npm uninstall react-beautiful-dnd react-bootstrap-daterangepicker
npm uninstall react-country-flag react-countup react-custom-scrollbars-2
npm uninstall react-datepicker react-feather react-icons react-input-mask
npm uninstall react-leaflet react-modal-video react-select
npm uninstall react-simple-wysiwyg react-slick react-tag-input
npm uninstall react-tag-input-component react-time-picker
npm uninstall resolve-url-loader slick-carousel start
npm uninstall sweetalert2 sweetalert2-react-content swiper
npm uninstall weather-icons-react yet-another-react-lightbox
npm uninstall primereact primeicons quill dragula
npm uninstall feather-icons-react jquery leaflet
npm uninstall clipboard-copy

# 2. Clean up dev dependencies
echo "🔧 Cleaning up dev dependencies..."
npm uninstall @types/axios @types/dragula @types/leaflet
npm uninstall @types/react-beautiful-dnd @types/react-bootstrap
npm uninstall @types/react-datepicker @types/react-input-mask
npm uninstall @types/react-modal-video @types/react-select
npm uninstall @types/react-slick

# 3. Install bundle analyzer
echo "📊 Installing bundle analyzer..."
npm install --save-dev webpack-bundle-analyzer

# 4. Clean install
echo "🧹 Performing clean install..."
rm -rf node_modules package-lock.json
npm install

echo "✅ Optimization complete!"
echo "🚀 Run 'npm start' to test the improvements"
echo "📊 Run 'npm run analyze' to analyze bundle size" 