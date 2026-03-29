export interface Person {
  id: string
  name: string
}

export interface ItemShare {
  personId: string
  percentage: number  // 0–100; all shares for one item should sum to ≤ 100
}

export interface ReceiptItem {
  id: string
  name: string
  price: number
  shares: ItemShare[]
}

export interface Settlement {
  id: string
  fromPersonId: string  // person who owes money
  toPersonId: string    // person who paid (= paidBy)
  amount: number        // total owed
  amountPaid: number    // cumulative payments already made
}

export interface Receipt {
  id: string
  title: string
  createdAt: number        // Unix ms timestamp; read-only after creation
  updatedAt: number
  date?: number            // Unix ms; user-set receipt date; falls back to createdAt when undefined
  imageData?: string       // base64 encoded source image; session-only, never persisted
  deletedAt?: number       // Unix ms; set on soft delete, undefined = active
  paidBy?: string          // personId of whoever paid the full receipt; undefined if not yet set
  tax?: number              // dollar amount added to bill; default 0
  tips?: number             // dollar amount added to bill; default 0
  people: Person[]
  items: ReceiptItem[]
  settlements: Settlement[]
}
