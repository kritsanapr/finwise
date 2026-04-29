import { pgTable, text, timestamp, decimal, integer, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  lineUserId: text("line_user_id").notNull().unique(),
  displayName: text("display_name"),
  pictureUrl: text("picture_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // e.g., "water", "electricity", "phone", "other"
  description: text("description"),
  expenseDate: timestamp("expense_date").notNull(),
  receiptId: uuid("receipt_id").references(() => receipts.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(), // Supabase Storage path
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  extractedMerchant: text("extracted_merchant"), // AI extracted: store name
  extractedDate: timestamp("extracted_date"), // AI extracted: purchase date
  extractedAmount: decimal("extracted_amount", { precision: 10, scale: 2 }), // AI extracted: total
  extractedItems: text("extracted_items"), // AI extracted: line items as JSON
  aiModel: text("ai_model"), // Model used for OCR
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;

// ---------------------------------------------------------------------------
// Bank Slips (สลิปธนาคาร) — Supabase File Storage
// Tracks image files uploaded to Supabase Storage bucket "bank-slips".
// Stores both the raw file metadata and AI-extracted transfer details.
// ---------------------------------------------------------------------------

export const bankSlips = pgTable("bank_slips", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expenseId: uuid("expense_id").references(() => expenses.id, {
    onDelete: "set null",
  }),

  // --- Supabase Storage file metadata ---
  bucketName: text("bucket_name").notNull().default("bank-slips"),  // Supabase Storage bucket name
  storagePath: text("storage_path").notNull(),                       // e.g. {userId}/{year}/{month}/{id}.jpg
  publicUrl: text("public_url"),                                     // Supabase public/signed URL
  fileName: text("file_name"),                                       // Original filename from device
  mimeType: text("mime_type"),                                       // image/jpeg | image/png | image/webp
  fileSize: integer("file_size"),                                    // bytes
  uploadStatus: text("upload_status").notNull().default("pending"),  // pending | uploaded | failed

  // --- AI-extracted Thai bank slip data ---
  bankName: text("bank_name"),                                                  // e.g. "SCB", "KBank", "BBL", "KTB"
  transferRef: text("transfer_ref"),                                            // Reference / transaction number on slip
  senderAccount: text("sender_account"),                                        // Masked sender account e.g. "***1234"
  receiverAccount: text("receiver_account"),                                    // Masked receiver account
  receiverName: text("receiver_name"),                                          // Receiver name as shown on slip
  transferAmount: decimal("transfer_amount", { precision: 10, scale: 2 }),      // Amount transferred (THB)
  transferDate: timestamp("transfer_date"),                                      // Date/time shown on slip
  isVerified: boolean("is_verified").notNull().default(false),                  // Manual verification flag
  aiModel: text("ai_model"),                                                    // AI model used for extraction

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BankSlip = typeof bankSlips.$inferSelect;
export type NewBankSlip = typeof bankSlips.$inferInsert;