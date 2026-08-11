import pytest
from backend.preprocessing.prompt_interpreter import prompt_interpreter

def test_prompt_interpreter_fit():
    spec = prompt_interpreter.parse('Make the shirt oversized and relaxed')
    assert spec.fit == 'oversized'
    assert spec.preserve_identity is True
    assert spec.preserve_background is True

def test_prompt_interpreter_sleeves():
    spec = prompt_interpreter.parse('Make it short sleeve with black color')
    assert spec.sleeve_length == 'short'
    assert spec.color_override == 'black'
    assert spec.preserve_identity is True

def test_prompt_interpreter_empty():
    spec = prompt_interpreter.parse('')
    assert spec.fit == 'regular'
    assert spec.preserve_identity is True
