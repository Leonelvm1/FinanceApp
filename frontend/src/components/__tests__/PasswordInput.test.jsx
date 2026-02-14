import { render, screen, fireEvent } from '@testing-library/react'
import PasswordInput from '../../components/PasswordInput'

describe('PasswordInput', () => {
  test('toggles password visibility when button is clicked', async () => {
    render(<PasswordInput label="Password" name="password" value="" onChange={() => {}} />)

    const input = screen.getByPlaceholderText(/•+/)
    expect(input).toHaveAttribute('type', 'password')

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(input).toHaveAttribute('type', 'text')
  })
})
