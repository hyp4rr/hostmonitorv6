<?php

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

$csvFile = 'c:\\Users\\hyper\\Downloads\\testip2.csv';
$xlsxFile = 'c:\\Users\\hyper\\Downloads\\testip2_final.xlsx';

// Read file and handle encoding
$content = file_get_contents($csvFile);
// Detect and convert encoding
if (mb_detect_encoding($content, 'UTF-8', true) === false) {
    $content = mb_convert_encoding($content, 'UTF-8', 'UTF-16LE');
}
// Remove BOM if present
if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
    $content = substr($content, 3);
}
$lines = explode("\n", trim($content));

// Parse existing data
$existingData = [];
$header = null;
foreach ($lines as $index => $line) {
    if ($index === 0) {
        $header = trim($line);
        continue;
    }
    if (empty(trim($line))) continue;
    
    $parts = explode("\t", $line);
    if (count($parts) >= 2) {
        $ip = trim($parts[1]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            $existingData[$ip] = trim($line);
        }
    }
}

// Generate all IPs in ranges
$allIps = [];
for ($subnet = 24; $subnet <= 27; $subnet++) {
    for ($host = 1; $host <= 254; $host++) {
        $ip = "10.8.$subnet.$host";
        $allIps[] = $ip;
    }
}

// Count number of columns from header
$headerColumns = explode("\t", $header);
$numColumns = count($headerColumns);

// Find User column index (column 5, 0-indexed)
$userColumnIndex = 5; // User is the 6th column (0-indexed: Name=0, IP=1, Http=2, Manufacturer=3, MAC=4, User=5, Comments=6)

// Create spreadsheet
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Set header row with styling
$columnLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
foreach ($headerColumns as $colIndex => $headerValue) {
    $colLetter = $columnLetters[$colIndex] ?? chr(65 + $colIndex);
    $sheet->setCellValue($colLetter . '1', trim($headerValue));
    
    // Style header
    $sheet->getStyle($colLetter . '1')->applyFromArray([
        'font' => [
            'bold' => true,
            'color' => ['rgb' => '000000'],
        ],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => ['rgb' => 'D9EAF7'],
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
            ],
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ]);
}

// Populate data rows
$rowNum = 2;
foreach ($allIps as $ip) {
    if (isset($existingData[$ip])) {
        // Use existing data
        $existingParts = explode("\t", $existingData[$ip]);
        // Pad with empty columns if needed
        while (count($existingParts) < $numColumns) {
            $existingParts[] = "";
        }
        // Trim to exact number of columns
        $existingParts = array_slice($existingParts, 0, $numColumns);
        $rowData = $existingParts;
        
        // Check if User column has a value, if so set it to "Ada"
        if (isset($rowData[$userColumnIndex]) && trim($rowData[$userColumnIndex]) !== "") {
            $rowData[$userColumnIndex] = "Ada";
        }
    } else {
        // Create new entry with IP as name
        $rowData = [$ip, $ip]; // Name and IP
        // Fill remaining columns with empty strings
        while (count($rowData) < $numColumns) {
            $rowData[] = "";
        }
    }
    
    // Write row data
    foreach ($rowData as $colIndex => $cellValue) {
        $colLetter = $columnLetters[$colIndex] ?? chr(65 + $colIndex);
        $sheet->setCellValue($colLetter . $rowNum, trim($cellValue));
        
        // Style data cells with borders
        $sheet->getStyle($colLetter . $rowNum)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);
    }
    $rowNum++;
}

// Auto-size columns
foreach ($headerColumns as $colIndex => $headerValue) {
    $colLetter = $columnLetters[$colIndex] ?? chr(65 + $colIndex);
    $sheet->getColumnDimension($colLetter)->setAutoSize(true);
}

// Write to XLSX file
$writer = new Xlsx($spreadsheet);
$writer->save($xlsxFile);

echo "Excel file created successfully!\n";
echo "Total IPs: " . count($allIps) . "\n";
echo "Existing entries preserved: " . count($existingData) . "\n";
echo "New entries added: " . (count($allIps) - count($existingData)) . "\n";
echo "\nFile saved as: testip2_updated.xlsx\n";

