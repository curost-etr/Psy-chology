param([string]$InputPath, [string]$OutputPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
function EscapeXml([string]$Text) { return [System.Security.SecurityElement]::Escape($Text) }
function RunXml([string]$Text) {
    $clean = $Text.Replace('`', '').Replace('**', '')
    return '<w:r><w:t xml:space="preserve">' + (EscapeXml $clean) + '</w:t></w:r>'
}
$body = New-Object System.Text.StringBuilder
$lines = Get-Content -LiteralPath $InputPath -Encoding UTF8
$inCode = $false
$inTable = $false
foreach ($line in $lines) {
    if ($line -eq '[[PAGEBREAK]]') { [void]$body.Append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'); continue }
    if ($line.StartsWith('|')) {
        if ($line -match '^\|[\s:|\-]+\|$') { continue }
        if (-not $inTable) {
            [void]$body.Append('<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>')
            $inTable = $true
        }
        [void]$body.Append('<w:tr>')
        foreach ($cell in $line.Trim('|').Split('|')) {
            [void]$body.Append('<w:tc><w:p><w:pPr><w:spacing w:after="80"/></w:pPr>' + (RunXml $cell.Trim()) + '</w:p></w:tc>')
        }
        [void]$body.Append('</w:tr>')
        continue
    }
    if ($inTable) { [void]$body.Append('</w:tbl>'); $inTable = $false }
    if ($line.StartsWith('```')) { $inCode = -not $inCode; continue }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $style = 'Normal'
    $textLine = $line.TrimEnd()
    if ($line -match '^(#{1,4})\s+(.+)$') {
        $style = @('Title', 'Heading1', 'Heading2', 'Heading3')[$Matches[1].Length - 1]
        $textLine = $Matches[2]
    } elseif ($inCode) { $style = 'Code' }
    if ($textLine.StartsWith('> ')) { $textLine = $textLine.Substring(2) }
    [void]$body.Append('<w:p><w:pPr><w:pStyle w:val="' + $style + '"/></w:pPr>' + (RunXml $textLine) + '</w:p>')
}
if ($inTable) { [void]$body.Append('</w:tbl>') }
$doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + $body.ToString() + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1134" w:bottom="1440" w:left="1134"/></w:sectPr></w:body></w:document>'
$styles = '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:eastAsia="宋体"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="300"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/><w:spacing w:before="240" w:after="160"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/><w:spacing w:before="180"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:pPr><w:spacing w:after="0" w:line="260"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas"/><w:sz w:val="18"/></w:rPr></w:style></w:styles>'
$parts = @{
    '[Content_Types].xml' = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
    '_rels/.rels' = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
    'word/document.xml' = $doc
    'word/styles.xml' = $styles
    'word/_rels/document.xml.rels' = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
}
$absoluteOutput = [System.IO.Path]::GetFullPath($OutputPath)
$stream = [System.IO.File]::Open($absoluteOutput, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($name in $parts.Keys) {
        $entry = $zip.CreateEntry($name)
        $writer = New-Object System.IO.StreamWriter($entry.Open(), (New-Object System.Text.UTF8Encoding($false)))
        try { $writer.Write($parts[$name]) } finally { $writer.Dispose() }
    }
} finally { $zip.Dispose(); $stream.Dispose() }
$check = [System.IO.Compression.ZipFile]::OpenRead($absoluteOutput)
try {
    foreach ($entry in $check.Entries) {
        $reader = New-Object System.IO.StreamReader($entry.Open())
        try { [xml]$validatedXml = $reader.ReadToEnd() } finally { $reader.Dispose() }
    }
} finally { $check.Dispose() }
Get-Item -LiteralPath $absoluteOutput | Select-Object Name, Length
