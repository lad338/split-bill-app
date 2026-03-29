import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ShareTable from '../../src/components/details/ShareTable'
import type { Person, ItemShare } from '../../src/types'

const people: Person[] = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
  { id: 'carol', name: 'Carol' },
]

describe('ShareTable', () => {
  it('renders a row for each person', () => {
    render(<ShareTable people={people} shares={[]} onChange={() => {}} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
  })

  it('shows % input for included participants', () => {
    const shares: ItemShare[] = [{ personId: 'alice', percentage: 70 }]
    render(<ShareTable people={people} shares={shares} onChange={() => {}} />)
    expect(screen.getByDisplayValue('70')).toBeInTheDocument()
  })

  it('shows 0% for people not in shares', () => {
    const shares: ItemShare[] = [{ personId: 'alice', percentage: 100 }]
    render(<ShareTable people={people} shares={shares} onChange={() => {}} />)
    // All 3 people always show inputs; Bob and Carol default to 0
    expect(screen.getAllByRole('textbox').length).toBe(3)
    expect(screen.getAllByDisplayValue('0').length).toBe(2)
  })

  it('calls onChange when user updates a percentage', async () => {
    const onChange = vi.fn()
    const shares: ItemShare[] = [{ personId: 'alice', percentage: 50 }]
    render(<ShareTable people={people} shares={shares} onChange={onChange} />)
    const input = screen.getByDisplayValue('50')
    await userEvent.clear(input)
    await userEvent.type(input, '60')
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ personId: 'alice', percentage: 60 })])
    )
  })

  it('shows total correctly', () => {
    const shares: ItemShare[] = [
      { personId: 'alice', percentage: 60 },
      { personId: 'bob', percentage: 40 },
    ]
    render(<ShareTable people={people} shares={shares} onChange={() => {}} />)
    expect(screen.getByText(/100%/)).toBeInTheDocument()
  })

  it('total line has error styling when total ≠ 100', () => {
    const shares: ItemShare[] = [
      { personId: 'alice', percentage: 60 },
      { personId: 'bob', percentage: 60 },
    ]
    const { container } = render(<ShareTable people={people} shares={shares} onChange={() => {}} />)
    const totalEl = container.querySelector('.share-total')
    expect(totalEl?.classList.contains('share-total--error')).toBe(true)
  })

  it('exclude button sets person to 0 and redistributes equally among those with > 0%', async () => {
    const onChange = vi.fn()
    const shares: ItemShare[] = [
      { personId: 'alice', percentage: 50 },
      { personId: 'bob', percentage: 50 },
    ]
    render(<ShareTable people={people} shares={shares} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /exclude alice/i }))
    const result: ItemShare[] = onChange.mock.calls[0][0]
    expect(result.find(s => s.personId === 'alice')?.percentage).toBe(0)
    expect(result.find(s => s.personId === 'bob')?.percentage).toBe(100)
    expect(result.find(s => s.personId === 'carol')?.percentage).toBe(0)
  })

  it('100% shortcut sets person to 100 and others to 0', async () => {
    const onChange = vi.fn()
    const shares: ItemShare[] = [
      { personId: 'alice', percentage: 50 },
      { personId: 'bob', percentage: 50 },
    ]
    render(<ShareTable people={people} shares={shares} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /alice 100%/i }))
    const result: ItemShare[] = onChange.mock.calls[0][0]
    expect(result.find(s => s.personId === 'alice')?.percentage).toBe(100)
    expect(result.find(s => s.personId === 'bob')?.percentage).toBe(0)
  })
})
