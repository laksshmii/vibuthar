# Resizes and re-encodes the generated course images so they ship at a sane
# weight. Run after adding a new image to src/assets.
param(
  [string]$Dir = "src/assets",
  [string[]]$Filter = @("course-*.jpg"),
  [int]$MaxWidth = 1200,
  [int]$Quality = 78
)

Add-Type -AssemblyName System.Drawing

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

Get-ChildItem -Path $Dir -Include $Filter -Recurse | ForEach-Object {
  $path = $_.FullName
  $before = [math]::Round($_.Length / 1KB)

  $img = [System.Drawing.Image]::FromFile($path)
  if ($img.Width -le $MaxWidth) {
    $w = $img.Width; $h = $img.Height
  } else {
    $w = $MaxWidth
    $h = [int][math]::Round($img.Height * ($MaxWidth / $img.Width))
  }

  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose()
  $img.Dispose()

  $tmp = "$path.tmp"
  $bmp.Save($tmp, $encoder, $params)
  $bmp.Dispose()
  Move-Item $tmp $path -Force

  $after = [math]::Round((Get-Item $path).Length / 1KB)
  "{0,-34} {1,5} KB -> {2,4} KB  ({3}x{4})" -f $_.Name, $before, $after, $w, $h
}
