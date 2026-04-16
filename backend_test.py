#!/usr/bin/env python3
"""
Backend Test Suite for Sarvam AI Integration
Tests the three new Sarvam AI endpoints:
1. GET /api/sarvam/languages
2. POST /api/sarvam/tts (Text-to-Speech)
3. POST /api/sarvam/stt (Speech-to-Text)
"""

import requests
import base64
import json
import time
from typing import Dict, Any

# Backend URL from frontend/.env
BASE_URL = "https://uniqueness-detector.preview.emergentagent.com/api"

class SarvamAITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def test_languages_endpoint(self) -> Dict[str, Any]:
        """Test GET /api/sarvam/languages endpoint"""
        print("\n=== Testing GET /api/sarvam/languages ===")
        
        try:
            response = self.session.get(f"{self.base_url}/sarvam/languages")
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                # Validate response structure
                required_keys = ['languages', 'default_language', 'tts_model', 'stt_model']
                missing_keys = [key for key in required_keys if key not in data]
                
                if missing_keys:
                    return {
                        'success': False,
                        'error': f"Missing required keys: {missing_keys}",
                        'response': data
                    }
                
                # Validate languages dict has 11 BCP-47 codes
                languages = data.get('languages', {})
                expected_codes = [
                    'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 
                    'kn-IN', 'gu-IN', 'ml-IN', 'od-IN', 'pa-IN', 'en-IN'
                ]
                
                missing_codes = [code for code in expected_codes if code not in languages]
                if missing_codes:
                    return {
                        'success': False,
                        'error': f"Missing language codes: {missing_codes}",
                        'response': data
                    }
                
                # Validate specific values
                if data.get('default_language') != 'hi-IN':
                    return {
                        'success': False,
                        'error': f"Expected default_language 'hi-IN', got '{data.get('default_language')}'",
                        'response': data
                    }
                
                if data.get('tts_model') != 'bulbul:v2':
                    return {
                        'success': False,
                        'error': f"Expected tts_model 'bulbul:v2', got '{data.get('tts_model')}'",
                        'response': data
                    }
                
                if data.get('stt_model') != 'saarika:v2.5':
                    return {
                        'success': False,
                        'error': f"Expected stt_model 'saarika:v2.5', got '{data.get('stt_model')}'",
                        'response': data
                    }
                
                return {
                    'success': True,
                    'message': 'Languages endpoint working correctly',
                    'response': data
                }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'response': None
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception: {str(e)}",
                'response': None
            }
    
    def test_tts_endpoint(self) -> Dict[str, Any]:
        """Test POST /api/sarvam/tts endpoint with multiple test cases"""
        print("\n=== Testing POST /api/sarvam/tts ===")
        
        test_results = {}
        
        # Test Case A: Happy path
        print("\n--- Test Case A: Happy Path ---")
        test_a_payload = {
            "text": "Justice delayed is justice denied.",
            "language_code": "hi-IN"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sarvam/tts", json=test_a_payload)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_keys = ['audio_base64', 'language_code', 'audio_format', 'chunk_count']
                missing_keys = [key for key in required_keys if key not in data]
                
                if missing_keys:
                    test_results['happy_path'] = {
                        'success': False,
                        'error': f"Missing keys: {missing_keys}"
                    }
                else:
                    # Validate values
                    if data.get('language_code') != 'hi-IN':
                        test_results['happy_path'] = {
                            'success': False,
                            'error': f"Expected language_code 'hi-IN', got '{data.get('language_code')}'"
                        }
                    elif data.get('audio_format') != 'wav':
                        test_results['happy_path'] = {
                            'success': False,
                            'error': f"Expected audio_format 'wav', got '{data.get('audio_format')}'"
                        }
                    elif data.get('chunk_count') < 1:
                        test_results['happy_path'] = {
                            'success': False,
                            'error': f"Expected chunk_count >= 1, got {data.get('chunk_count')}"
                        }
                    else:
                        # Validate base64 audio
                        audio_b64 = data.get('audio_base64', '')
                        if not audio_b64:
                            test_results['happy_path'] = {
                                'success': False,
                                'error': "audio_base64 is empty"
                            }
                        else:
                            try:
                                audio_bytes = base64.b64decode(audio_b64)
                                if len(audio_bytes) <= 10000:
                                    test_results['happy_path'] = {
                                        'success': False,
                                        'error': f"Audio too short: {len(audio_bytes)} bytes (expected > 10000)"
                                    }
                                else:
                                    test_results['happy_path'] = {
                                        'success': True,
                                        'message': f"Happy path working. Audio: {len(audio_bytes)} bytes, chunks: {data.get('chunk_count')}"
                                    }
                            except Exception as e:
                                test_results['happy_path'] = {
                                    'success': False,
                                    'error': f"Invalid base64 audio: {str(e)}"
                                }
            else:
                test_results['happy_path'] = {
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            test_results['happy_path'] = {
                'success': False,
                'error': f"Exception: {str(e)}"
            }
        
        # Test Case B: Long text (chunking)
        print("\n--- Test Case B: Long Text Chunking ---")
        long_sentence = "The Indian legal system is based on the English common law system and has evolved over centuries to incorporate various statutes, regulations, and judicial precedents that govern the administration of justice in the country."
        long_text = " ".join([long_sentence] * 5)  # ~1500 characters
        
        test_b_payload = {
            "text": long_text,
            "language_code": "en-IN"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sarvam/tts", json=test_b_payload)
            print(f"Status Code: {response.status_code}")
            print(f"Text length: {len(long_text)} characters")
            
            if response.status_code == 200:
                data = response.json()
                chunk_count = data.get('chunk_count', 0)
                
                if chunk_count < 3:
                    test_results['long_text'] = {
                        'success': False,
                        'error': f"Expected chunk_count >= 3 for long text, got {chunk_count}"
                    }
                else:
                    # Validate audio is a single WAV file
                    audio_b64 = data.get('audio_base64', '')
                    try:
                        audio_bytes = base64.b64decode(audio_b64)
                        # Check for WAV header (first 4 bytes should be b"RIFF")
                        if audio_bytes[:4] != b"RIFF":
                            test_results['long_text'] = {
                                'success': False,
                                'error': f"Audio doesn't start with RIFF header: {audio_bytes[:4]}"
                            }
                        else:
                            test_results['long_text'] = {
                                'success': True,
                                'message': f"Long text chunking working. Chunks: {chunk_count}, Audio: {len(audio_bytes)} bytes"
                            }
                    except Exception as e:
                        test_results['long_text'] = {
                            'success': False,
                            'error': f"Audio validation failed: {str(e)}"
                        }
            else:
                test_results['long_text'] = {
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            test_results['long_text'] = {
                'success': False,
                'error': f"Exception: {str(e)}"
            }
        
        # Test Case C: Invalid language
        print("\n--- Test Case C: Invalid Language ---")
        test_c_payload = {
            "text": "Test",
            "language_code": "fr-FR"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sarvam/tts", json=test_c_payload)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                response_text = response.text.lower()
                if 'unsupported' in response_text or 'language' in response_text:
                    test_results['invalid_language'] = {
                        'success': True,
                        'message': "Invalid language correctly rejected"
                    }
                else:
                    test_results['invalid_language'] = {
                        'success': False,
                        'error': f"Expected unsupported language error, got: {response.text}"
                    }
            else:
                test_results['invalid_language'] = {
                    'success': False,
                    'error': f"Expected HTTP 400, got {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            test_results['invalid_language'] = {
                'success': False,
                'error': f"Exception: {str(e)}"
            }
        
        # Test Case D: Empty text
        print("\n--- Test Case D: Empty Text ---")
        test_d_payload = {
            "text": "",
            "language_code": "hi-IN"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sarvam/tts", json=test_d_payload)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code in [400, 422]:
                test_results['empty_text'] = {
                    'success': True,
                    'message': "Empty text correctly rejected"
                }
            else:
                test_results['empty_text'] = {
                    'success': False,
                    'error': f"Expected HTTP 400/422 for empty text, got {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            test_results['empty_text'] = {
                'success': False,
                'error': f"Exception: {str(e)}"
            }
        
        return test_results
    
    def test_stt_endpoint(self) -> Dict[str, Any]:
        """Test POST /api/sarvam/stt endpoint"""
        print("\n=== Testing POST /api/sarvam/stt ===")
        
        test_results = {}
        
        # First, generate audio using TTS for round-trip test
        print("\n--- Generating audio for STT test ---")
        tts_payload = {
            "text": "My name is Raj and I was falsely accused.",
            "language_code": "hi-IN"
        }
        
        try:
            tts_response = self.session.post(f"{self.base_url}/sarvam/tts", json=tts_payload)
            
            if tts_response.status_code != 200:
                return {
                    'round_trip': {
                        'success': False,
                        'error': f"TTS failed for STT test: HTTP {tts_response.status_code}"
                    }
                }
            
            tts_data = tts_response.json()
            audio_base64 = tts_data.get('audio_base64')
            
            if not audio_base64:
                return {
                    'round_trip': {
                        'success': False,
                        'error': "TTS returned no audio for STT test"
                    }
                }
            
            print(f"Generated audio: {len(base64.b64decode(audio_base64))} bytes")
            
            # Test Case A: Round-trip STT with translation
            print("\n--- Test Case A: Round-trip STT with Translation ---")
            stt_payload = {
                "audio_base64": audio_base64,
                "audio_mime_type": "audio/wav",
                "translate_to_english": True
            }
            
            stt_response = self.session.post(f"{self.base_url}/sarvam/stt", json=stt_payload)
            print(f"Status Code: {stt_response.status_code}")
            
            if stt_response.status_code == 200:
                stt_data = stt_response.json()
                print(f"STT Response: {json.dumps(stt_data, indent=2)}")
                
                # Validate response structure
                required_keys = ['transcript', 'translated', 'mode', 'detected_language']
                missing_keys = [key for key in required_keys if key not in stt_data]
                
                if missing_keys:
                    test_results['round_trip'] = {
                        'success': False,
                        'error': f"Missing keys: {missing_keys}"
                    }
                else:
                    transcript = stt_data.get('transcript', '').lower()
                    translated = stt_data.get('translated')
                    mode = stt_data.get('mode')
                    detected_language = stt_data.get('detected_language')
                    
                    # Validate values
                    if not transcript:
                        test_results['round_trip'] = {
                            'success': False,
                            'error': "Transcript is empty"
                        }
                    elif translated != True:
                        test_results['round_trip'] = {
                            'success': False,
                            'error': f"Expected translated=true, got {translated}"
                        }
                    elif mode != 'translate':
                        test_results['round_trip'] = {
                            'success': False,
                            'error': f"Expected mode='translate', got '{mode}'"
                        }
                    elif not detected_language:
                        test_results['round_trip'] = {
                            'success': False,
                            'error': "detected_language is empty"
                        }
                    else:
                        # Check if transcript contains recognizable words
                        expected_words = ['raj', 'name', 'falsely', 'accused']
                        found_words = [word for word in expected_words if word in transcript]
                        
                        if len(found_words) >= 2:  # At least 2 recognizable words
                            test_results['round_trip'] = {
                                'success': True,
                                'message': f"Round-trip STT working. Transcript: '{transcript}', Found words: {found_words}"
                            }
                        else:
                            test_results['round_trip'] = {
                                'success': False,
                                'error': f"Transcript doesn't contain expected words. Got: '{transcript}'"
                            }
            else:
                test_results['round_trip'] = {
                    'success': False,
                    'error': f"HTTP {stt_response.status_code}: {stt_response.text}"
                }
                
        except Exception as e:
            test_results['round_trip'] = {
                'success': False,
                'error': f"Exception: {str(e)}"
            }
        
        # Test Case B: Invalid base64
        print("\n--- Test Case B: Invalid Base64 ---")
        invalid_payload = {
            "audio_base64": "not-valid-base64!!",
            "audio_mime_type": "audio/wav"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sarvam/stt", json=invalid_payload)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                test_results['invalid_base64'] = {
                    'success': True,
                    'message': "Invalid base64 correctly rejected"
                }
            else:
                test_results['invalid_base64'] = {
                    'success': False,
                    'error': f"Expected HTTP 400 for invalid base64, got {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            test_results['invalid_base64'] = {
                'success': False,
                'error': f"Exception: {str(e)}"
            }
        
        return test_results
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all Sarvam AI endpoint tests"""
        print("🧪 Starting Sarvam AI Integration Tests")
        print(f"Backend URL: {self.base_url}")
        
        all_results = {}
        
        # Test 1: Languages endpoint
        all_results['languages'] = self.test_languages_endpoint()
        
        # Test 2: TTS endpoint
        all_results['tts'] = self.test_tts_endpoint()
        
        # Test 3: STT endpoint
        all_results['stt'] = self.test_stt_endpoint()
        
        return all_results
    
    def print_summary(self, results: Dict[str, Any]):
        """Print test summary"""
        print("\n" + "="*60)
        print("🧪 SARVAM AI INTEGRATION TEST SUMMARY")
        print("="*60)
        
        total_tests = 0
        passed_tests = 0
        
        for endpoint, endpoint_results in results.items():
            print(f"\n📡 {endpoint.upper()} ENDPOINT:")
            
            if isinstance(endpoint_results, dict) and 'success' in endpoint_results:
                # Single test result (languages endpoint)
                total_tests += 1
                if endpoint_results['success']:
                    passed_tests += 1
                    print(f"  ✅ {endpoint_results.get('message', 'PASSED')}")
                else:
                    print(f"  ❌ {endpoint_results.get('error', 'FAILED')}")
            else:
                # Multiple test results (tts/stt endpoints)
                for test_name, test_result in endpoint_results.items():
                    total_tests += 1
                    if test_result['success']:
                        passed_tests += 1
                        print(f"  ✅ {test_name}: {test_result.get('message', 'PASSED')}")
                    else:
                        print(f"  ❌ {test_name}: {test_result.get('error', 'FAILED')}")
        
        print(f"\n📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED!")
        else:
            print(f"⚠️  {total_tests - passed_tests} tests failed")
        
        return passed_tests, total_tests


def main():
    """Main test execution"""
    tester = SarvamAITester()
    results = tester.run_all_tests()
    passed, total = tester.print_summary(results)
    
    # Return results for programmatic use
    return {
        'results': results,
        'summary': {
            'passed': passed,
            'total': total,
            'success_rate': passed / total if total > 0 else 0
        }
    }


if __name__ == "__main__":
    main()