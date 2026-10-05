import { describe, expect, it } from 'bun:test';

import { DomainEvent } from '../events/domain-event.js';
import { AggregateRoot } from './aggregate-root.js';
import { Identifier } from './identifier.js';

class OrderId extends Identifier {
  static create() {
    return new OrderId(Identifier.newValue());
  }

  static from(value: string) {
    return new OrderId(Identifier.assertValid(value));
  }
}

class OrderPlaced extends DomainEvent {
  constructor(readonly orderId: string) {
    super(new Date());
  }
}

class Order extends AggregateRoot<OrderId, { placed: boolean }> {
  static draft() {
    return new Order(OrderId.create(), { placed: false });
  }

  place() {
    this.props.placed = true;
    this.addDomainEvent(new OrderPlaced(this.id.value));
  }
}

describe('AggregateRoot', () => {
  it('records events and releases them exactly once', () => {
    const order = Order.draft();
    order.place();

    const events = order.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrderPlaced);
    expect(order.pullDomainEvents()).toHaveLength(0);
  });

  it('is equal to another instance with the same id', () => {
    const order = Order.draft();
    const sameOrder = new (Order as unknown as new (id: OrderId, p: object) => Order)(
      OrderId.from(order.id.value),
      { placed: true },
    );
    expect(order.equals(sameOrder)).toBe(true);
    expect(order.equals(Order.draft())).toBe(false);
  });

  it('rejects malformed identifiers', () => {
    expect(() => OrderId.from('not-a-uuid')).toThrow('not a valid identifier');
  });
});
