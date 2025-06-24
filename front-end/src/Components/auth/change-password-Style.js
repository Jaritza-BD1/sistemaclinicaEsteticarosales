// src/Components/auth/ChangePassword.styles.js
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

export const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
`;

export const Logo = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

export const Subtitle = styled.p`
  margin: 5px 0 0;
  font-size: 16px;
  opacity: 0.9;
`;

export const FormContainer = styled.div`
  padding: 30px;
`;

export const FormTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
  text-align: center;
`;

export const FormDescription = styled.p`
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 25px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid ${props => props.$hasError ? '#e74c3c' : '#ddd'};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    outline: none;
  }
`;

export const ErrorText = styled.span`
  display: block;
  margin-top: 6px;
  color: #e74c3c;
  font-size: 14px;
`;

export const PasswordRequirements = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    color: #2c3e50;
  }
  
  ul {
    padding-left: 20px;
    margin: 0;
  }
  
  li {
    margin-bottom: 5px;
    font-size: 14px;
    color: #7f8c8d;
    
    &.valid {
      color: #27ae60;
      font-weight: 500;
    }
    
    &.invalid {
      color: #e74c3c;
    }
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

export const CancelButton = styled(Button)`
  background: #ecf0f1;
  color: #7f8c8d;
  margin-top: 15px;
  
  &:hover {
    background: #d5dbdb;
  }
`;

export const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
`;

export const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
`;

export const Footer = styled.div`
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
  
  p {
    margin: 5px 0;
  }
`;

