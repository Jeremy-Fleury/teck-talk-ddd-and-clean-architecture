```mermaid
erDiagram

        ExampleStatus {
            draft draft
active active
archived archived
        }
    


        TransactionType {
            credit credit
debit debit
        }
    
  "User" {
    String id "🗝️"
    String auth0Id 
    String email "❓"
    String firstName "❓"
    String lastName "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  
```
