import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CreateableSelectionComponent, SelectionComponent } from '../components/Buttons'

const mockOptions = [
    {value: 'Option-1', label: 'Option 1'},
    {value: 'Option-2', label: 'Option 2'},
    {value: 'Option-3', label: 'Option 3'},
]

describe('SelectionComponent', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should render the component', () => {
        const mockOnChange = vi.fn()
        render(
            <SelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />
        )

        const select = screen.getByLabelText(/Test Label/i)

        expect(select).toBeInTheDocument()
        expect(select).toBeTruthy()
    })

    it('should call onChange when the first option is selected', async () => {
        const mockOnChange = vi.fn()
        render(
            <form data-testid="test-form">
                <SelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />
            </form>
        )

        const select = screen.getByLabelText(/Test Label/i)

        expect(select).toBeDefined()
        expect(select).not.toBeNull()
        expect(mockOnChange).toHaveBeenCalledTimes(0)

        fireEvent.keyDown(select, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 1'))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-1', label: 'Option 1'},
        expect.objectContaining({
            action: 'select-option',
            name: 'test',
        }))

    })

    it('should call onChange when the second option is selected', async () => {
        const mockOnChange = vi.fn()
        render(<SelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />)

        const select = screen.getByLabelText(/Test Label/i)

        expect(select).toBeDefined()
        expect(select).not.toBeNull()
        expect(mockOnChange).toHaveBeenCalledTimes(0)

        fireEvent.keyDown(select, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 1'))

        expect(mockOnChange).toHaveBeenCalledTimes(1)

        fireEvent.keyDown(select, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('Option 2')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 2'))

        expect(mockOnChange).toHaveBeenCalledTimes(2)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-2', label: 'Option 2'},
            expect.objectContaining({
                action: 'select-option',
                name: 'test',
            })
        )
    })

    it('should call onChange when typing in the search bar', async () => {
        const mockOnChange = vi.fn()
        render(<SelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />)

        const select = screen.getByLabelText(/Test Label/i)
        
        fireEvent.change(select, { target: { value: 'Option 1' } })
        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 1'))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-1', label: 'Option 1'},
            expect.objectContaining({
                action: 'select-option',
                name: 'test',
            })
        )
    })
})

describe('CreateableSelectionComponent', () => {
    it('should render the component', () => {
        const mockOnChange = vi.fn()
        render(
            <CreateableSelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />
        )

        const select = screen.getByLabelText(/Test Label/i)

        expect(select).toBeInTheDocument()
        expect(select).toBeTruthy()
    })

    it('should call onChange when the first option is selected', async () => {
        const mockOnChange = vi.fn()
        render(
            <form data-testid="test-form">
                <CreateableSelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />
            </form>
        )

        const select = screen.getByLabelText(/Test Label/i)

        expect(select).toBeDefined()
        expect(select).not.toBeNull()
        expect(mockOnChange).toHaveBeenCalledTimes(0)

        fireEvent.keyDown(select, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Option 1'))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-1', label: 'Option 1'},
            expect.objectContaining({
                action: 'select-option',
                name: 'test',
            })
        )
    })

    it('should call onChange when the second option is selected', async () => {
        const mockOnChange = vi.fn()
        render(
            <form data-testid="test-form">
                <CreateableSelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />
            </form>
        )

        const select = screen.getByLabelText(/Test Label/i)

        expect(select).toBeDefined()
        expect(select).not.toBeNull()
        expect(mockOnChange).toHaveBeenCalledTimes(0)

        fireEvent.keyDown(select, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 1'))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-1', label: 'Option 1'},
            expect.objectContaining({   
                action: 'select-option',
                name: 'test',
            })
        )
    })

    it('should call onChange when typing in the search bar', async () => {
        const mockOnChange = vi.fn()
        render(
            <form data-testid="test-form">
                <CreateableSelectionComponent label="Test Label" options={mockOptions} name={'test'} onChange={mockOnChange} />
            </form>
        )

        const select = screen.getByLabelText(/Test Label/i)

        fireEvent.change(select, { target: { value: 'Option 1' } })
        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 1'))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-1', label: 'Option 1'},
            expect.objectContaining({
                action: 'select-option',
                name: 'test',
            })
        )

        fireEvent.change(select, { target: { value: 'Option 2' } })
        await waitFor(() => {
            expect(screen.getByText('Option 2')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('Option 2'))

        expect(mockOnChange).toHaveBeenCalledTimes(2)
        expect(mockOnChange).toHaveBeenCalledWith(
            {value: 'Option-2', label: 'Option 2'},
            expect.objectContaining({
                action: 'select-option',
                name: 'test',
            })
        )
    })
})