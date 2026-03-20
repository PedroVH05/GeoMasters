import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Country, ALL_COUNTRIES, getCountriesByDifficulty, Difficulty } from '../countries';

@Component({
  selector: 'app-flags',
  imports: [CommonModule],
  templateUrl: './flags.html',
})
export class Flags implements OnInit, OnDestroy {
  // Estados del juego
  gameStarted = false;
  gameEnded = false;
  showDifficultySelector = true;
  
  // Dificultad
  selectedDifficulty: Difficulty = 'easy';
  difficulties: Array<{ value: Difficulty; label: string; description: string }> = [
    { value: 'easy', label: 'Fácil', description: 'Banderas muy reconocibles' },
    { value: 'medium', label: 'Medio', description: 'Banderas moderadamente conocidas' },
    { value: 'hard', label: 'Difícil', description: 'Banderas complicadas y poco conocidas' }
  ];
  
  // Contadores
  timeElapsed = 0;
  currentBandera = 1;
  correctAnswers = 0;
  
  // Datos del juego
  currentCountryCode: string | null = null;
  currentCountryName: string | null = null;
  options: Country[] = [];
  selectedAnswer: string | null = null;
  showFeedback = false;
  isCorrect = false;
  
  // Control de banderas mostradas en la partida actual
  usedCountryCodes: Set<string> = new Set();
  
  // Países disponibles - importados desde countries.ts
  allCountries: Country[] = ALL_COUNTRIES;
  
  private timerInterval: any;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone, private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startGame() {
    this.gameStarted = true;
    this.showDifficultySelector = false;
    this.gameEnded = false;
    this.timeElapsed = 0;
    this.currentBandera = 1;
    this.correctAnswers = 0;
    this.selectedAnswer = null;
    this.showFeedback = false;
    
    // Obtener los países según la dificultad seleccionada
    this.allCountries = getCountriesByDifficulty(this.selectedDifficulty);
    this.usedCountryCodes = new Set();

    // Iniciar timer dentro de la zona de Angular para que detecte cambios
    this.ngZone.runOutsideAngular(() => {
      this.timerInterval = setInterval(() => {
        this.timeElapsed++;
        // Ejecutar detección de cambios en Angular cada segundo
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }, 1000);
    });

    // Cargar primera bandera
    this.loadNextFlag();
  }

  selectDifficulty(difficulty: Difficulty) {
    this.selectedDifficulty = difficulty;
  }

  loadNextFlag() {
    if (this.currentBandera > 20) {
      this.endGame();
      return;
    }

    this.showFeedback = false;
    this.selectedAnswer = null;

    // Filtrar países que no hayan sido usados en esta partida
    const availableCountries = this.allCountries.filter(
      country => !this.usedCountryCodes.has(country.code)
    );

    // Si se agotan los países disponibles, usar todos de nuevo
    if (availableCountries.length === 0) {
      this.usedCountryCodes.clear();
      availableCountries.length = 0;
      availableCountries.push(...this.allCountries);
    }

    // Seleccionar un país aleatorio de los disponibles
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const selectedCountry = availableCountries[randomIndex];
    
    // Marcar como usado
    this.usedCountryCodes.add(selectedCountry.code);
    
    this.currentCountryCode = selectedCountry.code;
    this.currentCountryName = selectedCountry.name;

    // Generar 4 opciones (incluyendo la correcta)
    const incorrectCountries = availableCountries
      .filter(c => c.code !== selectedCountry.code)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    this.options = [selectedCountry, ...incorrectCountries].sort(() => Math.random() - 0.5);
  }

  selectAnswer(country: Country) {
    if (this.showFeedback) return;

    this.selectedAnswer = country.code;
    this.isCorrect = country.code === this.currentCountryCode;
    this.showFeedback = true;

    if (this.isCorrect) {
      this.correctAnswers++;
    }

    // Forzar detección de cambios para mostrar el feedback
    this.cdr.detectChanges();

    // Avanzar después de 1 segundo
    setTimeout(() => {
      this.currentBandera++;
      this.loadNextFlag();
      // Forzar detección de cambios después de cargar la siguiente bandera
      this.cdr.detectChanges();
    }, 1000);
  }

  endGame() {
    this.gameEnded = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  restartGame() {
    this.gameStarted = false;
    this.gameEnded = false;
    this.showDifficultySelector = true;
    this.startGame();
  }

  goToHome() {
    this.router.navigate(['']);
  }

  getFlagUrl(): string {
    return `https://flagsapi.com/${this.currentCountryCode}/flat/64.png`;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}`;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}