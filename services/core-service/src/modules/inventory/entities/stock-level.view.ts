import { ViewEntity, ViewColumn, Connection } from 'typeorm';

@ViewEntity({
  name: 'stock_level_view',
  expression: (connection: Connection) => 
    connection
      .createQueryBuilder()
      .select('it.tenant_id', 'tenantId')
      .addSelect('it.item_id', 'itemId')
      .addSelect('i.code', 'itemCode')
      .addSelect('i.name', 'itemName')
      .addSelect('it.warehouse_id', 'warehouseId')
      .addSelect('w.name', 'warehouseName')
      .addSelect(`
        SUM(CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END)
      `, 'quantityOnHand')
      .addSelect('0', 'quantityReserved')
      .addSelect(`
        SUM(CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END)
      `, 'quantityAvailable')
      .addSelect(`
        CASE 
          WHEN SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.quantity
            WHEN it.transaction_type = 'out' THEN -it.quantity
            WHEN it.transaction_type = 'adjust' THEN it.quantity
            ELSE 0
          END) > 0 
          THEN SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.amount
            ELSE 0
          END) / SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.quantity
            WHEN it.transaction_type = 'out' THEN -it.quantity
            WHEN it.transaction_type = 'adjust' THEN it.quantity
            ELSE 0
          END)
          ELSE 0
        END
      `, 'averageUnitPrice')
      .addSelect(`
        SUM(CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END) * 
        CASE 
          WHEN SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.quantity
            WHEN it.transaction_type = 'out' THEN -it.quantity
            WHEN it.transaction_type = 'adjust' THEN it.quantity
            ELSE 0
          END) > 0 
          THEN SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.amount
            ELSE 0
          END) / SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.quantity
            WHEN it.transaction_type = 'out' THEN -it.quantity
            WHEN it.transaction_type = 'adjust' THEN it.quantity
            ELSE 0
          END)
          ELSE 0
        END
      `, 'totalValue')
      .from('inventory_transaction', 'it')
      .leftJoin('item', 'i', 'it.item_id = i.id')
      .leftJoin('warehouse', 'w', 'it.warehouse_id = w.id')
      .where('it.status = :status', { status: 'posted' })
      .groupBy('it.tenant_id')
      .addGroupBy('it.item_id')
      .addGroupBy('i.code')
      .addGroupBy('i.name')
      .addGroupBy('it.warehouse_id')
      .addGroupBy('w.name')
})
export class StockLevelView {
  @ViewColumn()
  tenantId: string;

  @ViewColumn()
  itemId: string;

  @ViewColumn()
  itemCode: string;

  @ViewColumn()
  itemName: string;

  @ViewColumn()
  warehouseId: string;

  @ViewColumn()
  warehouseName: string;

  @ViewColumn()
  quantityOnHand: number;

  @ViewColumn()
  quantityReserved: number;

  @ViewColumn()
  quantityAvailable: number;

  @ViewColumn()
  averageUnitPrice: number;

  @ViewColumn()
  totalValue: number;
}
