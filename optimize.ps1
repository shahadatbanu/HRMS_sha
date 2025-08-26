# React Performance Optimization Script for PowerShell

Write-Host "🚀 Starting React Performance Optimization..." -ForegroundColor Green

# 1. Clean up heavy dependencies
Write-Host "📦 Cleaning up heavy dependencies..." -ForegroundColor Yellow

$dependenciesToRemove = @(
    "@fortawesome/fontawesome-free",
    "@fortawesome/free-solid-svg-icons", 
    "@fortawesome/react-fontawesome",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/react",
    "@fullcalendar/timegrid",
    "@hello-pangea/dnd",
    "@react-latest-ui/react-sticky-notes",
    "apexcharts",
    "react-apexcharts",
    "react-awesome-stars-rating",
    "react-beautiful-dnd",
    "react-bootstrap-daterangepicker",
    "react-country-flag",
    "react-countup",
    "react-custom-scrollbars-2",
    "react-datepicker",
    "react-feather",
    "react-icons",
    "react-input-mask",
    "react-leaflet",
    "react-modal-video",
    "react-select",
    "react-simple-wysiwyg",
    "react-slick",
    "react-tag-input",
    "react-tag-input-component",
    "react-time-picker",
    "resolve-url-loader",
    "slick-carousel",
    "start",
    "sweetalert2",
    "sweetalert2-react-content",
    "swiper",
    "weather-icons-react",
    "yet-another-react-lightbox",
    "primereact",
    "primeicons",
    "quill",
    "dragula",
    "feather-icons-react",
    "jquery",
    "leaflet",
    "clipboard-copy"
)

foreach ($dep in $dependenciesToRemove) {
    Write-Host "Removing $dep..." -ForegroundColor Gray
    npm uninstall $dep
}

# 2. Clean up dev dependencies
Write-Host "🔧 Cleaning up dev dependencies..." -ForegroundColor Yellow

$devDependenciesToRemove = @(
    "@types/axios",
    "@types/dragula", 
    "@types/leaflet",
    "@types/react-beautiful-dnd",
    "@types/react-bootstrap",
    "@types/react-datepicker",
    "@types/react-input-mask",
    "@types/react-modal-video",
    "@types/react-select",
    "@types/react-slick"
)

foreach ($dep in $devDependenciesToRemove) {
    Write-Host "Removing $dep..." -ForegroundColor Gray
    npm uninstall $dep
}

# 3. Install bundle analyzer
Write-Host "📊 Installing bundle analyzer..." -ForegroundColor Yellow
npm install --save-dev webpack-bundle-analyzer

# 4. Clean install
Write-Host "🧹 Performing clean install..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

Write-Host "✅ Optimization complete!" -ForegroundColor Green
Write-Host "🚀 Run 'npm start' to test the improvements" -ForegroundColor Cyan
Write-Host "📊 Run 'npm run analyze' to analyze bundle size" -ForegroundColor Cyan 