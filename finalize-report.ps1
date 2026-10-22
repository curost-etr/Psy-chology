param([string]$Workspace)
$ErrorActionPreference = 'Stop'
$docPath = Join-Path $Workspace '人工智能算法大赛技术报告_参赛版.docx'
$pdfPath = Join-Path $Workspace '人工智能算法大赛技术报告_参赛版.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($docPath)
    $doc.Content.Font.Name = '宋体'
    $doc.Content.Font.NameFarEast = '宋体'
    $doc.Content.Font.Size = 12
    $doc.Content.ParagraphFormat.LineSpacingRule = 0
    $doc.Content.ParagraphFormat.SpaceAfter = 6
    $doc.PageSetup.PaperSize = 7
    $doc.PageSetup.Orientation = 0
    $doc.PageSetup.TopMargin = $word.CentimetersToPoints(2.5)
    $doc.PageSetup.BottomMargin = $word.CentimetersToPoints(2.5)
    $doc.PageSetup.LeftMargin = $word.CentimetersToPoints(3)
    $doc.PageSetup.RightMargin = $word.CentimetersToPoints(3)
    $doc.PageSetup.Gutter = 0
    $doc.PageSetup.HeaderDistance = $word.CentimetersToPoints(1.5)
    $doc.PageSetup.FooterDistance = $word.CentimetersToPoints(1.5)
    foreach ($config in @(@(-2,16), @(-3,14), @(-4,12))) {
        $style = $doc.Styles.Item([int]$config[0])
        $style.Font.Name = '宋体'
        $style.Font.NameFarEast = '宋体'
        $style.Font.Size = [int]$config[1]
        $style.Font.Bold = -1
        $style.ParagraphFormat.KeepWithNext = -1
        $style.ParagraphFormat.SpaceBefore = 12
        $style.ParagraphFormat.SpaceAfter = 6
        $style.ParagraphFormat.LineSpacingRule = 0
    }
    $title = $doc.Styles.Item(-63)
    $title.Font.Name = '宋体'
    $title.Font.Size = 22
    $title.Font.Bold = -1
    $title.ParagraphFormat.SpaceBefore = 8
    $title.ParagraphFormat.SpaceAfter = 12
    $coverEnd = $doc.Content.Duplicate
    [void]$coverEnd.Find.Execute('目 录')
    $cover = $doc.Range(0,$coverEnd.Start)
    $cover.ParagraphFormat.Alignment = 1
    $cover.ParagraphFormat.SpaceAfter = 16
    $imageRange = $doc.Content.Duplicate
    if ($imageRange.Find.Execute('[[IMAGE_FRONTEND]]')) {
        $imageRange.Text = ''
        $image = $doc.InlineShapes.AddPicture((Join-Path $Workspace 'report-assets/frontend.png'),$false,$true,$imageRange)
        $image.LockAspectRatio = -1
        $image.Width = $word.CentimetersToPoints(15)
        $image.Range.ParagraphFormat.Alignment = 1
        $image.Range.ParagraphFormat.KeepWithNext = -1
    }
    foreach ($table in $doc.Tables) {
        $table.AutoFitBehavior(2)
        $table.Range.Font.Size = 10.5
        $table.Range.ParagraphFormat.SpaceAfter = 3
        $table.Rows.Item(1).Range.Font.Bold = -1
        $table.Rows.Item(1).Shading.BackgroundPatternColor = 15132390
        $table.Rows.Item(1).HeadingFormat = -1
        $table.Rows.AllowBreakAcrossPages = 0
    }
    foreach ($paragraph in $doc.Paragraphs) {
        if ($paragraph.Range.Text.StartsWith('图 1')) {
            $paragraph.Range.Font.Size = 10.5
            $paragraph.Range.ParagraphFormat.Alignment = 1
        }
        if ($paragraph.Range.Style.NameLocal -eq 'Code') {
            $paragraph.Range.Font.Size = 9
            $paragraph.Range.ParagraphFormat.SpaceAfter = 0
        }
    }
    $tocRange = $doc.Content.Duplicate
    if ($tocRange.Find.Execute('[[TOC]]')) {
        $tocRange.Text = ''
        [void]$doc.TablesOfContents.Add($tocRange,$true,1,2)
    }
    $doc.Save()
    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Fields.Update() | Out-Null
    $doc.Save()
    $doc.ExportAsFixedFormat($pdfPath,17,$false,0)
    $pages = $doc.ComputeStatistics(2)
    $doc.Close(0)
    $pdf = Get-Item -LiteralPath $pdfPath
    if ($pdf.Length -ge 10000000) { throw 'PDF exceeds the 10 MB size limit.' }
    [PSCustomObject]@{PDF=$pdf.FullName;Bytes=$pdf.Length;Megabytes=[math]::Round($pdf.Length/1000000,3);Pages=$pages}
} finally { $word.Quit() }
