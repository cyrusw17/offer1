<?php

declare(strict_types=1);

final class LeadStore
{
    private PDO $db;

    public function __construct(private string $storagePath)
    {
        $dir = dirname($storagePath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $this->db = new PDO('sqlite:' . $storagePath);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->migrate();
    }

    private function migrate(): void
    {
        $this->db->exec(<<<'SQL'
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                business_name TEXT NOT NULL,
                location TEXT NOT NULL,
                industry TEXT NOT NULL,
                message TEXT,
                source TEXT DEFAULT 'founding-landing',
                created_at TEXT NOT NULL
            )
        SQL);
    }

    public function save(array $data): int
    {
        $stmt = $this->db->prepare(<<<'SQL'
            INSERT INTO leads (name, phone, business_name, location, industry, message, source, created_at)
            VALUES (:name, :phone, :business_name, :location, :industry, :message, :source, :created_at)
        SQL);

        $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':business_name' => $data['business_name'],
            ':location' => $data['location'],
            ':industry' => $data['industry'],
            ':message' => $data['message'] ?? '',
            ':source' => $data['source'] ?? 'founding-landing',
            ':created_at' => gmdate('c'),
        ]);

        return (int) $this->db->lastInsertId();
    }
}
